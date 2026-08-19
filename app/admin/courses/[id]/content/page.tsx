import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { CurriculumBuilder, type BuilderModule } from '@/components/admin/curriculum-builder'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Course content' }

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', id)
    .maybeSingle()
  if (!course) notFound()

  const { data: modules } = await supabase
    .from('modules')
    .select('id, position, title, duration, lessons(position, title, kind, video_id)')
    .eq('course_id', id)
    .order('position')

  const initial: BuilderModule[] = (modules ?? []).map((m) => ({
    title: m.title,
    duration: m.duration ?? '',
    lessons: (
      (m.lessons ?? []) as Array<{
        position: number
        title: string
        kind: string
        video_id: string | null
      }>
    )
      .sort((a, b) => a.position - b.position)
      .map((l) => ({ title: l.title, kind: l.kind, videoId: l.video_id })),
  }))

  return (
    <AdminShell active="/admin/courses" user={{ fullName: admin.full_name }}>
      <Link href={`/admin/courses/${course.id}`} className="text-meta text-muted mb-4 inline-block">
        ← {course.title}
      </Link>
      <AdminHeader
        title="Course content"
        subtitle="Modules and their lessons, in the order students work through them."
      />
      <CurriculumBuilder courseId={course.id} initial={initial} />
    </AdminShell>
  )
}
