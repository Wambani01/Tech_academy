import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { CourseForm } from '@/components/admin/course-form'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Edit course' }

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: course }, { data: instructors }, { count }] = await Promise.all([
    supabase
      .from('courses')
      .select(
        'id, title, track, level, blurb, description, duration, price_kes, lead_instructor_id, status'
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('instructors').select('id, full_name').order('position'),
    supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', id)
      .neq('status', 'cancelled'),
  ])

  if (!course) notFound()

  return (
    <AdminShell active="/admin/courses" user={{ fullName: admin.full_name }}>
      <Link href="/admin/courses" className="text-meta text-muted mb-4 inline-block">
        ← All courses
      </Link>
      <AdminHeader
        title={course.title}
        subtitle={`${count ?? 0} enrolled`}
        action={
          <Link
            href={`/admin/courses/${course.id}/content`}
            className="border-[1.5px] border-ink text-ink px-[22px] py-[13px] rounded-md text-ui font-bold whitespace-nowrap"
          >
            Edit curriculum
          </Link>
        }
      />
      <CourseForm
        initial={{
          id: course.id,
          title: course.title,
          track: course.track,
          level: course.level,
          blurb: course.blurb,
          description: course.description ?? '',
          duration: course.duration,
          priceKes: course.price_kes,
          leadInstructorId: course.lead_instructor_id,
          status: course.status,
        }}
        instructors={(instructors ?? []).map((i) => ({ id: i.id, fullName: i.full_name }))}
        enrolled={count ?? 0}
      />
    </AdminShell>
  )
}
