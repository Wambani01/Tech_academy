import type { Metadata } from 'next'
import { PageSubtitle, PageTitle, StudentShell } from '@/components/student/student-shell'
import { AssignmentsTable, type AssignmentRow } from '@/components/student/assignments-table'
import { requireProfile } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { formatShortDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Assignments', robots: { index: false } }

export default async function AssignmentsPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: enrolments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('profile_id', profile.id)

  const courseIds = (enrolments ?? []).map((e) => e.course_id)

  const [{ data: assignments }, { data: submissions }] = await Promise.all([
    courseIds.length
      ? supabase
          .from('assignments')
          .select('id, title, due_at, courses(title)')
          .in('course_id', courseIds)
          .order('due_at', { ascending: true, nullsFirst: false })
      : Promise.resolve({ data: [] as never[] }),
    supabase
      .from('submissions')
      .select('assignment_id, status, score')
      .eq('profile_id', profile.id),
  ])

  const byAssignment = new Map(
    (submissions ?? []).map((s) => [s.assignment_id, s] as const)
  )

  const rows: AssignmentRow[] = (assignments ?? []).map((a) => {
    const submission = byAssignment.get(a.id)
    const status =
      submission?.status === 'graded'
        ? 'Graded'
        : submission?.status === 'submitted'
          ? 'Submitted'
          : 'Pending'
    return {
      id: a.id,
      title: a.title,
      course: (a.courses as { title: string } | null)?.title ?? '',
      due: a.due_at ? formatShortDate(a.due_at) : '—',
      status,
      score: submission?.score ?? null,
    }
  })

  return (
    <StudentShell
      active="/assignments"
      user={{ fullName: profile.full_name, track: profile.track }}
    >
      <PageTitle>Assignments</PageTitle>
      <PageSubtitle>
        Track what&rsquo;s due, submitted, and graded across your courses.
      </PageSubtitle>
      <AssignmentsTable rows={rows} />
    </StudentShell>
  )
}
