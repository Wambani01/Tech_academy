'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/format'
import type { CourseStatus, EnquiryStatus } from '@/types/database'

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

async function admin() {
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

function fail(e: unknown, fallback: string): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : fallback }
}

/* ---------------------------------------------------------------- courses */

export type CourseInput = {
  id?: string
  title: string
  track: string
  level: string
  blurb: string
  description: string
  duration: string
  priceKes: number
  leadInstructorId: string | null
  status: CourseStatus
}

export async function saveCourse(input: CourseInput): Promise<ActionResult> {
  try {
    if (!input.title.trim()) return { ok: false, error: 'Enter a course title.' }
    if (!input.blurb.trim()) return { ok: false, error: 'Enter a short blurb.' }
    if (input.priceKes < 0) return { ok: false, error: 'Price cannot be negative.' }

    const { supabase } = await admin()
    const payload = {
      title: input.title.trim(),
      track: input.track,
      level: input.level,
      blurb: input.blurb.trim(),
      description: input.description.trim() || null,
      duration: input.duration.trim(),
      price_kes: input.priceKes,
      lead_instructor_id: input.leadInstructorId,
      status: input.status,
    }

    if (input.id) {
      const { error } = await supabase.from('courses').update(payload).eq('id', input.id)
      if (error) return { ok: false, error: error.message }
      revalidatePath('/admin/courses')
      revalidatePath('/courses')
      return { ok: true, id: input.id }
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({ ...payload, slug: slugify(input.title) })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }

    revalidatePath('/admin/courses')
    revalidatePath('/courses')
    return { ok: true, id: data.id }
  } catch (e) {
    return fail(e, 'Could not save the course.')
  }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/courses')
    revalidatePath('/courses')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not delete the course.')
  }
}

/* ---------------------------------------------------- modules and lessons */

export async function saveCurriculum(
  courseId: string,
  modules: Array<{
    title: string
    duration: string
    lessons: Array<{ title: string; kind: string; videoId: string | null }>
  }>
): Promise<ActionResult> {
  try {
    const { supabase } = await admin()

    // Replace wholesale: the builder always posts the complete tree.
    const { error: clearError } = await supabase.from('modules').delete().eq('course_id', courseId)
    if (clearError) return { ok: false, error: clearError.message }

    for (const [i, mod] of modules.entries()) {
      if (!mod.title.trim()) continue
      const { data: created, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          position: i + 1,
          title: mod.title.trim(),
          duration: mod.duration.trim() || null,
        })
        .select('id')
        .single()
      if (error) return { ok: false, error: error.message }

      const lessons = mod.lessons
        .filter((l) => l.title.trim())
        .map((l, j) => ({
          module_id: created.id,
          position: j + 1,
          title: l.title.trim(),
          kind: l.kind,
          video_id: l.videoId,
        }))

      if (lessons.length) {
        const { error: lessonError } = await supabase.from('lessons').insert(lessons)
        if (lessonError) return { ok: false, error: lessonError.message }
      }
    }

    revalidatePath(`/admin/courses/${courseId}/content`)
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not save the curriculum.')
  }
}

/* --------------------------------------------------------------- students */

export async function removeStudent(profileId: string): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    // Archive rather than destroy: enrolments and progress are kept.
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'cancelled' })
      .eq('profile_id', profileId)
    if (error) return { ok: false, error: error.message }

    revalidatePath('/admin/students')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not remove the student.')
  }
}

/** Convert an enquiry into a real enrolment. */
export async function enrolStudent(
  profileId: string,
  courseId: string,
  enquiryId?: string
): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    const { error } = await supabase
      .from('enrollments')
      .upsert(
        { profile_id: profileId, course_id: courseId, status: 'active', progress_pct: 0 },
        { onConflict: 'profile_id,course_id' }
      )
    if (error) return { ok: false, error: error.message }

    if (enquiryId) {
      await supabase.from('enquiries').update({ status: 'enrolled' }).eq('id', enquiryId)
    }

    revalidatePath('/admin/students')
    revalidatePath('/admin/enquiries')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not create the enrolment.')
  }
}

/* ------------------------------------------------------------ instructors */

export type InstructorInput = {
  id?: string
  fullName: string
  email: string
  track: string
  roleTitle: string
  bio: string
  photoId: string | null
}

export async function saveInstructor(input: InstructorInput): Promise<ActionResult> {
  try {
    if (!input.fullName.trim()) return { ok: false, error: 'Enter the instructor’s name.' }
    if (!input.email.trim()) return { ok: false, error: 'Enter an email address.' }

    const { supabase } = await admin()
    const payload = {
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      track: input.track,
      role_title: input.roleTitle,
      bio: input.bio.trim() || null,
      photo_id: input.photoId,
    }

    if (input.id) {
      const { error } = await supabase.from('instructors').update(payload).eq('id', input.id)
      if (error) return { ok: false, error: error.message }
    } else {
      const { data: last } = await supabase
        .from('instructors')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()
      const { error } = await supabase
        .from('instructors')
        .insert({ ...payload, position: (last?.position ?? 0) + 1 })
      if (error) return { ok: false, error: error.message }
    }

    revalidatePath('/admin/instructors')
    revalidatePath('/about')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not save the instructor.')
  }
}

export async function deleteInstructor(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    const { error } = await supabase.from('instructors').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/instructors')
    revalidatePath('/about')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not remove the instructor.')
  }
}

/* ----------------------------------------------------------------- events */

export type EventInput = {
  id?: string
  title: string
  track: string
  format: string
  startsAt: string
  capacity: number | null
  description: string
}

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  try {
    if (!input.title.trim()) return { ok: false, error: 'Enter an event title.' }
    if (!input.startsAt) return { ok: false, error: 'Pick a date and time.' }

    const { supabase } = await admin()
    const payload = {
      title: input.title.trim(),
      track: input.track,
      format: input.format,
      starts_at: new Date(input.startsAt).toISOString(),
      capacity: input.capacity,
      description: input.description.trim() || null,
    }

    if (input.id) {
      const { error } = await supabase.from('events').update(payload).eq('id', input.id)
      if (error) return { ok: false, error: error.message }
    } else {
      const { error } = await supabase
        .from('events')
        .insert({ ...payload, slug: slugify(input.title), status: 'upcoming' })
      if (error) return { ok: false, error: error.message }
    }

    revalidatePath('/admin/events')
    revalidatePath('/events')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not save the event.')
  }
}

export async function cancelEvent(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/events')
    revalidatePath('/events')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not cancel the event.')
  }
}

/* ------------------------------------------------------------------ media */

export async function deleteMediaAsset(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    // page_blocks.image_id is ON DELETE SET NULL, so live pages fall back to the
    // striped placeholder rather than breaking.
    const { error } = await supabase.from('media_assets').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/media')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not delete the image.')
  }
}

export async function registerMediaAsset(input: {
  publicId: string
  filename: string
  folder: string
  width: number | null
  height: number | null
  bytes: number | null
  alt: string | null
}): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        public_id: input.publicId,
        filename: input.filename,
        folder: input.folder,
        width: input.width,
        height: input.height,
        bytes: input.bytes,
        alt: input.alt,
      })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/media')
    return { ok: true, id: data.id }
  } catch (e) {
    return fail(e, 'Could not record the upload.')
  }
}

/* -------------------------------------------------------------- enquiries */

export async function setEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<ActionResult> {
  try {
    const { supabase } = await admin()
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/enquiries')
    return { ok: true }
  } catch (e) {
    return fail(e, 'Could not update the enquiry.')
  }
}
