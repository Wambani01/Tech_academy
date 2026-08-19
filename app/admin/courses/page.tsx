import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { CoursesManager, type AdminCourseRow } from '@/components/admin/courses-manager'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Courses' }

export default async function ManageCoursesPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: courses }, { data: enrolments }] = await Promise.all([
    supabase
      .from('courses')
      .select('id, slug, title, track, level, price_kes, status')
      .order('track')
      .order('title'),
    supabase.from('enrollments').select('course_id').neq('status', 'cancelled'),
  ])

  const counts = new Map<string, number>()
  for (const row of enrolments ?? []) {
    counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1)
  }

  const rows: AdminCourseRow[] = (courses ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    track: c.track,
    level: c.level,
    priceKes: c.price_kes,
    status: c.status,
    enrolled: counts.get(c.id) ?? 0,
  }))

  return (
    <AdminShell active="/admin/courses" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Courses"
        subtitle="Every program in the catalogue, published or draft."
        action={
          <Link
            href="/admin/courses/new"
            className="bg-ink text-cream px-[22px] py-[13px] rounded-md text-ui font-bold whitespace-nowrap"
          >
            + New course
          </Link>
        }
      />
      <CoursesManager courses={rows} />
    </AdminShell>
  )
}
