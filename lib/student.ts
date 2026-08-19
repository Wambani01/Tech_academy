import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/queries'
import type { Profile } from '@/types/database'

/**
 * Student-area data access.
 *
 * The middleware already bounces anonymous visitors, so these helpers assume a
 * session exists and redirect defensively if it does not.
 */

export type SessionProfile = Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'track' | 'avatar_id'>

export async function requireProfile(): Promise<SessionProfile> {
  if (!isSupabaseConfigured()) redirect('/sign-in')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, track, avatar_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/sign-in')
  return profile
}

export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireProfile()
  if (profile.role !== 'admin') redirect('/admin/sign-in?denied=1')
  return profile
}

export type EnrolledCourse = {
  slug: string
  title: string
  track: string
  progressPct: number
  moduleCount: number
  currentModule: number
  status: string
}

export type DashboardData = {
  coursesInProgress: number
  coursesCompleted: number
  certificatesEarned: number
  avgScore: number | null
  inProgress: EnrolledCourse[]
  upcoming: Array<{ id: string; title: string; course: string; dueLabel: string }>
  latestCertificate: string | null
}

/** Days until a due date, worded as the dashboard words it. */
export function dueLabel(dueAt: string | null): string {
  if (!dueAt) return 'No due date'
  const days = Math.ceil((new Date(dueAt).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

export async function getDashboard(profileId: string): Promise<DashboardData> {
  const supabase = await createClient()

  const [{ data: enrollments }, { data: certificates }, { data: submissions }] =
    await Promise.all([
      supabase
        .from('enrollments')
        .select('progress_pct, status, courses(slug, title, track)')
        .eq('profile_id', profileId)
        .order('enrolled_at', { ascending: false }),
      supabase
        .from('certificates')
        .select('issued_at, courses(title)')
        .eq('profile_id', profileId)
        .order('issued_at', { ascending: false }),
      supabase
        .from('submissions')
        .select('score')
        .eq('profile_id', profileId)
        .eq('status', 'graded'),
    ])

  const rows = enrollments ?? []
  const active = rows.filter((r) => r.status === 'active')
  const courseIds = rows
    .map((r) => (r.courses as { slug: string } | null)?.slug)
    .filter(Boolean)

  // Upcoming assignments for the courses the student is enrolled in.
  let upcoming: DashboardData['upcoming'] = []
  if (courseIds.length) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, due_at, courses(title, slug)')
      .not('due_at', 'is', null)
      .gte('due_at', new Date().toISOString())
      .order('due_at')
      .limit(5)

    upcoming = (assignments ?? [])
      .filter((a) => {
        const c = a.courses as { slug: string } | null
        return c ? courseIds.includes(c.slug) : false
      })
      .map((a) => ({
        id: a.id,
        title: a.title,
        course: (a.courses as { title: string } | null)?.title ?? '',
        dueLabel: dueLabel(a.due_at),
      }))
  }

  const scores = (submissions ?? [])
    .map((s) => s.score)
    .filter((s): s is number => typeof s === 'number')

  return {
    coursesInProgress: active.length,
    coursesCompleted: rows.filter((r) => r.status === 'completed').length,
    certificatesEarned: certificates?.length ?? 0,
    avgScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null,
    inProgress: active.map((r) => {
      const c = r.courses as { slug: string; title: string; track: string } | null
      return {
        slug: c?.slug ?? '',
        title: c?.title ?? '',
        track: c?.track ?? '',
        progressPct: r.progress_pct,
        moduleCount: 0,
        currentModule: 0,
        status: r.status,
      }
    }),
    upcoming,
    latestCertificate:
      (certificates?.[0]?.courses as { title: string } | null)?.title ?? null,
  }
}
