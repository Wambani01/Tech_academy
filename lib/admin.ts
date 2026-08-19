import { createClient } from '@/lib/supabase/server'

/** Aggregates for the console overview. */

export type Kpis = {
  activeStudents: number
  newEnrolments: number
  completionRate: number | null
  openEnquiries: number
}

export async function getKpis(): Promise<Kpis> {
  const supabase = await createClient()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [students, newEnrolments, allEnrolments, enquiries] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .gte('enrolled_at', monthStart.toISOString()),
    supabase.from('enrollments').select('status'),
    supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'contacted']),
  ])

  const rows = allEnrolments.data ?? []
  const completed = rows.filter((r) => r.status === 'completed').length

  return {
    activeStudents: students.count ?? 0,
    newEnrolments: newEnrolments.count ?? 0,
    completionRate: rows.length ? Math.round((completed / rows.length) * 100) : null,
    openEnquiries: enquiries.count ?? 0,
  }
}

/** Enrolments per month for the last six months, oldest first. */
export async function getEnrolmentSeries(): Promise<Array<{ label: string; value: number }>> {
  const supabase = await createClient()

  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  start.setMonth(start.getMonth() - 5)

  const { data } = await supabase
    .from('enrollments')
    .select('enrolled_at')
    .gte('enrolled_at', start.toISOString())

  const buckets: Array<{ label: string; value: number; key: string }> = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(start)
    d.setMonth(start.getMonth() + i)
    buckets.push({
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      value: 0,
      key: `${d.getFullYear()}-${d.getMonth()}`,
    })
  }

  for (const row of data ?? []) {
    const d = new Date(row.enrolled_at)
    const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (bucket) bucket.value++
  }

  return buckets.map(({ label, value }) => ({ label, value }))
}

export async function getRecentEnrolments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('enrollments')
    .select('id, enrolled_at, profiles(full_name), courses(title, price_kes)')
    .order('enrolled_at', { ascending: false })
    .limit(5)
  return data ?? []
}
