'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/cms/actions'

/** FAQ collection mutations. The public accordion revalidates on every write. */

export const FAQ_LIMITS = { question: 100, answer: 400 } as const

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

function revalidateFaqs() {
  revalidatePath('/')
  revalidatePath('/admin/faqs')
  revalidatePath('/admin/content')
}

export async function upsertFaq(input: {
  id?: string
  question: string
  answer: string
  category: string
  isLive: boolean
}): Promise<ActionResult> {
  try {
    const question = input.question.trim()
    const answer = input.answer.trim()
    if (!question) return { ok: false, error: 'Enter a question.' }
    if (!answer) return { ok: false, error: 'Enter an answer.' }
    if (question.length > FAQ_LIMITS.question)
      return { ok: false, error: `Keep the question under ${FAQ_LIMITS.question} characters.` }
    if (answer.length > FAQ_LIMITS.answer)
      return { ok: false, error: `Keep the answer under ${FAQ_LIMITS.answer} characters.` }

    const { supabase, userId } = await requireAdminClient()

    if (input.id) {
      const { error } = await supabase
        .from('faqs')
        .update({
          question,
          answer,
          category: input.category,
          is_live: input.isLive,
          updated_by: userId,
        })
        .eq('id', input.id)
      if (error) return { ok: false, error: error.message }
    } else {
      const { data: last } = await supabase
        .from('faqs')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { error } = await supabase.from('faqs').insert({
        position: (last?.position ?? 0) + 1,
        question,
        answer,
        category: input.category,
        is_live: input.isLive,
        updated_by: userId,
      })
      if (error) return { ok: false, error: error.message }
    }

    revalidateFaqs()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save the question.' }
  }
}

export async function setFaqLive(id: string, isLive: boolean): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdminClient()
    const { error } = await supabase
      .from('faqs')
      .update({ is_live: isLive, updated_by: userId })
      .eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidateFaqs()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not update the question.' }
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminClient()
    const { error } = await supabase.from('faqs').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidateFaqs()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not delete the question.' }
  }
}

/** Swap a question with its neighbour. Positions are 1-based and contiguous. */
export async function moveFaq(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminClient()

    const { data: rows } = await supabase.from('faqs').select('id, position').order('position')
    if (!rows) return { ok: false, error: 'Could not read the collection.' }

    const index = rows.findIndex((r) => r.id === id)
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (index === -1 || swapWith < 0 || swapWith >= rows.length) {
      return { ok: false, error: 'That question is already at the end.' }
    }

    const a = rows[index]!
    const b = rows[swapWith]!

    // Park one row out of the way so the (position) values never collide.
    const parked = Math.max(...rows.map((r) => r.position)) + 1
    const steps = [
      supabase.from('faqs').update({ position: parked }).eq('id', a.id),
      supabase.from('faqs').update({ position: a.position }).eq('id', b.id),
      supabase.from('faqs').update({ position: b.position }).eq('id', a.id),
    ]
    for (const step of steps) {
      const { error } = await step
      if (error) return { ok: false, error: error.message }
    }

    revalidateFaqs()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not reorder.' }
  }
}
