'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { blockRegistry } from '@/lib/cms/schemas'
import type { BlockKind, Json } from '@/types/database'

/**
 * CMS draft/publish mechanics.
 *
 *   edit field      → page_blocks.draft_fields = merged payload
 *   Save draft      → persists draft_fields; page.status unchanged
 *   Publish changes → fields = draft_fields; draft_fields = null;
 *                     pages.published_at = now(); revalidatePath('/' + slug)
 *
 * A block is dirty when `draft_fields is not null`. Public reads use `fields`.
 */

export type ActionResult = { ok: true } | { ok: false; error: string }

/** Route a page slug back to its public path. */
function publicPath(slug: string): string {
  return slug === 'home' ? '/' : `/${slug}`
}

async function requireAdminClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Console access required.')
  return { supabase, userId: user.id }
}

export async function saveBlockDraft(input: {
  blockId: string
  kind: BlockKind
  fields: Record<string, string>
  imageId: string | null
  imageAlt: string | null
  pageSlug: string
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdminClient()

    // The schema is the single source of truth for the field limits.
    const parsed = blockRegistry[input.kind].schema.safeParse(input.fields)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the field lengths.' }
    }

    const { error } = await supabase
      .from('page_blocks')
      .update({
        draft_fields: parsed.data as Json,
        image_id: input.imageId,
        image_alt: input.imageAlt,
        updated_by: userId,
      })
      .eq('id', input.blockId)

    if (error) return { ok: false, error: error.message }

    revalidatePath(`/admin/content/${input.pageSlug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save the draft.' }
  }
}

/** Copies every dirty block's draft onto its live payload, in one pass. */
export async function publishPage(pageSlug: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdminClient()

    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', pageSlug)
      .single()
    if (!page) return { ok: false, error: 'That page no longer exists.' }

    const { data: dirty } = await supabase
      .from('page_blocks')
      .select('id, draft_fields')
      .eq('page_id', page.id)
      .not('draft_fields', 'is', null)

    for (const block of dirty ?? []) {
      const { error } = await supabase
        .from('page_blocks')
        .update({ fields: block.draft_fields as Json, draft_fields: null, updated_by: userId })
        .eq('id', block.id)
      if (error) return { ok: false, error: error.message }
    }

    const { error: pageError } = await supabase
      .from('pages')
      .update({ status: 'published', published_at: new Date().toISOString(), updated_by: userId })
      .eq('id', page.id)
    if (pageError) return { ok: false, error: pageError.message }

    revalidatePath(publicPath(pageSlug))
    revalidatePath('/admin/content')
    revalidatePath(`/admin/content/${pageSlug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not publish.' }
  }
}

/** "Publish all" on the content index — every page carrying a draft. */
export async function publishAllPages(): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminClient()

    const { data: dirtyBlocks } = await supabase
      .from('page_blocks')
      .select('pages(slug)')
      .not('draft_fields', 'is', null)

    const slugs = Array.from(
      new Set(
        (dirtyBlocks ?? [])
          .map((b) => (b.pages as { slug: string } | null)?.slug)
          .filter((s): s is string => Boolean(s))
      )
    )

    for (const slug of slugs) {
      const result = await publishPage(slug)
      if (!result.ok) return result
    }

    revalidatePath('/admin/content')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not publish.' }
  }
}
