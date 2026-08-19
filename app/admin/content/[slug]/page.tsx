import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { PageEditor, type EditorBlock, type LibraryItem } from '@/components/admin/page-editor'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { cldUrl } from '@/lib/cloudinary'
import { assetFallback } from '@/lib/content/defaults'
import { formatBytes, relativeTime } from '@/lib/format'
import type { BlockKind } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return { title: `Editing ${slug}` }
}

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('id, slug, title, published_at')
    .eq('slug', slug)
    .maybeSingle()

  if (!page) notFound()

  const [{ data: blockRows }, { data: assets }] = await Promise.all([
    supabase
      .from('page_blocks')
      .select('id, position, kind, fields, draft_fields, image_id, image_alt')
      .eq('page_id', page.id)
      .order('position'),
    supabase
      .from('media_assets')
      .select('id, public_id, filename, width, height, bytes')
      .order('created_at', { ascending: false }),
  ])

  const library: LibraryItem[] = (assets ?? []).map((a) => ({
    id: a.id,
    publicId: a.public_id,
    filename: a.filename,
    url: cldUrl(a.public_id, 'card') ?? assetFallback(a.public_id),
    meta: `${a.width ?? '?'}×${a.height ?? '?'} · ${formatBytes(a.bytes)}`,
  }))

  // The admin always edits the draft: `draft_fields ?? fields`.
  const blocks: EditorBlock[] = (blockRows ?? []).map((b) => ({
    id: b.id,
    position: b.position,
    kind: b.kind as BlockKind,
    fields: ((b.draft_fields ?? b.fields) ?? {}) as Record<string, string>,
    imageId: b.image_id,
    imageAlt: b.image_alt,
    dirty: b.draft_fields !== null,
  }))

  return (
    <AdminShell active="/admin/content" user={{ fullName: admin.full_name }}>
      <Link href="/admin/content" className="text-meta text-muted mb-4 inline-block">
        ← All pages
      </Link>
      <PageEditor
        pageSlug={page.slug}
        pageTitle={page.title}
        blocks={blocks}
        library={library}
        lastPublished={page.published_at ? relativeTime(page.published_at) : null}
      />
    </AdminShell>
  )
}
