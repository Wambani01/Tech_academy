import { createClient } from '@/lib/supabase/server'
import { PAGE_DEFAULTS, type DefaultBlock } from '@/lib/content/defaults'
import {
  SEED_COURSES,
  SEED_CURRICULUM,
  SEED_EVENTS,
  SEED_FAQS,
  SEED_INSTRUCTORS,
  SEED_OUTCOMES,
} from '@/lib/content/seed-data'
import type { BlockKind, Course, EventRow, Faq, Instructor } from '@/types/database'

/**
 * Public data access.
 *
 * Every reader falls back to the seed content when Supabase is unconfigured or
 * unreachable, so the marketing site builds and renders before the database is
 * provisioned. Once rows exist, the database is the source of truth.
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export type ResolvedBlock = {
  id: string
  position: number
  kind: BlockKind
  fields: Record<string, string>
  image: string | null
  imageAlt: string | null
  cardImages: string[]
}

function fromDefaults(defaults: DefaultBlock[]): ResolvedBlock[] {
  return defaults.map((b) => ({
    id: `default-${b.position}`,
    position: b.position,
    kind: b.kind,
    fields: b.fields,
    image: b.image ?? null,
    imageAlt: b.imageAlt ?? null,
    cardImages: b.cardImages ?? [],
  }))
}

/** Public reads use `fields`; the admin preview uses `draft_fields ?? fields`. */
export async function getPageBlocks(slug: string, preview = false): Promise<ResolvedBlock[]> {
  const defaults = PAGE_DEFAULTS[slug] ?? []
  if (!isSupabaseConfigured()) return fromDefaults(defaults)

  try {
    const supabase = await createClient()
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!page) return fromDefaults(defaults)

    const { data: blocks } = await supabase
      .from('page_blocks')
      .select('id, position, kind, fields, draft_fields, image_alt, media_assets(public_id)')
      .eq('page_id', page.id)
      .order('position')

    if (!blocks?.length) return fromDefaults(defaults)

    return blocks.map((b) => {
      const raw = (preview ? (b.draft_fields ?? b.fields) : b.fields) ?? {}
      const asset = b.media_assets as { public_id: string } | null
      return {
        id: b.id,
        position: b.position,
        kind: b.kind,
        fields: raw as Record<string, string>,
        image: asset?.public_id ?? null,
        imageAlt: b.image_alt,
        cardImages: [],
      }
    })
  } catch {
    return fromDefaults(defaults)
  }
}

export function findBlock(blocks: ResolvedBlock[], kind: BlockKind): ResolvedBlock | undefined {
  return blocks.find((b) => b.kind === kind)
}

export type CourseCard = Pick<
  Course,
  'slug' | 'title' | 'track' | 'level' | 'blurb' | 'duration' | 'price_kes'
>

export async function getPublishedCourses(): Promise<CourseCard[]> {
  const fallback = SEED_COURSES.filter((c) => c.status === 'published')
  if (!isSupabaseConfigured()) return fallback

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('courses')
      .select('slug, title, track, level, blurb, duration, price_kes')
      .eq('status', 'published')
      .order('track')
    return data?.length ? data : fallback
  } catch {
    return fallback
  }
}

export type CourseDetail = CourseCard & {
  description: string | null
  hero_id: string | null
  curriculum: Array<{ title: string; duration: string }>
  outcomes: string[]
  instructor: Pick<Instructor, 'full_name' | 'role_title' | 'bio' | 'photo_id'> | null
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  const seed = SEED_COURSES.find((c) => c.slug === slug && c.status === 'published')
  const seedDetail: CourseDetail | null = seed
    ? {
        ...seed,
        description: seed.description ?? seed.blurb,
        hero_id: seed.hero_id ?? 'courses/course-workspace',
        curriculum: SEED_CURRICULUM[slug] ?? [],
        outcomes: SEED_OUTCOMES[slug] ?? [],
        instructor:
          SEED_INSTRUCTORS.find((i) => i.track === seed.track && i.role_title === 'Lead Instructor')
            ? {
                full_name: SEED_INSTRUCTORS.find(
                  (i) => i.track === seed.track && i.role_title === 'Lead Instructor'
                )!.full_name,
                role_title: 'Lead Instructor',
                bio:
                  SEED_INSTRUCTORS.find(
                    (i) => i.track === seed.track && i.role_title === 'Lead Instructor'
                  )!.bio ?? null,
                photo_id:
                  SEED_INSTRUCTORS.find(
                    (i) => i.track === seed.track && i.role_title === 'Lead Instructor'
                  )!.photo_id ?? null,
              }
            : null,
      }
    : null

  if (!isSupabaseConfigured()) return seedDetail

  try {
    const supabase = await createClient()
    const { data: course } = await supabase
      .from('courses')
      .select(
        'id, slug, title, track, level, blurb, duration, price_kes, description, hero_id, instructors(full_name, role_title, bio, photo_id)'
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (!course) return seedDetail

    const { data: modules } = await supabase
      .from('modules')
      .select('title, duration')
      .eq('course_id', course.id)
      .order('position')

    const instructor = course.instructors as CourseDetail['instructor']

    return {
      slug: course.slug,
      title: course.title,
      track: course.track,
      level: course.level,
      blurb: course.blurb,
      duration: course.duration,
      price_kes: course.price_kes,
      description: course.description,
      hero_id: course.hero_id,
      curriculum: (modules ?? []).map((m) => ({ title: m.title, duration: m.duration ?? '' })),
      outcomes: SEED_OUTCOMES[slug] ?? [],
      instructor,
    }
  } catch {
    return seedDetail
  }
}

export type EventCard = Pick<
  EventRow,
  'slug' | 'title' | 'track' | 'format' | 'starts_at' | 'description' | 'status'
>

export async function getEvents(): Promise<EventCard[]> {
  const fallback = SEED_EVENTS.filter((e) => e.status !== 'cancelled')
  if (!isSupabaseConfigured()) return fallback

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select('slug, title, track, format, starts_at, description, status')
      .neq('status', 'cancelled')
      .order('starts_at')
    return data?.length ? data : fallback
  } catch {
    return fallback
  }
}

export type FaqItem = Pick<Faq, 'question' | 'answer' | 'category'>

/** Only `is_live` questions ever reach the public accordion. */
export async function getLiveFaqs(): Promise<FaqItem[]> {
  const fallback = SEED_FAQS.filter((f) => f.is_live).map(
    ({ question, answer, category }) => ({ question, answer, category })
  )
  if (!isSupabaseConfigured()) return fallback

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('faqs')
      .select('question, answer, category')
      .eq('is_live', true)
      .order('position')
    return data?.length ? data : fallback
  } catch {
    return fallback
  }
}

export type InstructorCard = Pick<
  Instructor,
  'full_name' | 'track' | 'role_title' | 'bio' | 'photo_id'
>

export async function getInstructors(): Promise<InstructorCard[]> {
  const fallback = SEED_INSTRUCTORS.map((i) => ({
    full_name: i.full_name,
    track: i.track,
    role_title: i.role_title,
    bio: i.bio,
    photo_id: i.photo_id ?? null,
  }))
  if (!isSupabaseConfigured()) return fallback

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('instructors')
      .select('full_name, track, role_title, bio, photo_id')
      .order('position')
    return data?.length ? data : fallback
  } catch {
    return fallback
  }
}
