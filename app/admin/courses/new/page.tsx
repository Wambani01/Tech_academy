import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { CourseForm } from '@/components/admin/course-form'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'New course' }

export default async function AddCoursePage() {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase.from('instructors').select('id, full_name').order('position')

  return (
    <AdminShell active="/admin/courses" user={{ fullName: admin.full_name }}>
      <Link href="/admin/courses" className="text-meta text-muted mb-4 inline-block">
        ← All courses
      </Link>
      <AdminHeader title="New course" subtitle="Details, curriculum, then pricing and publish." />
      <CourseForm
        wizard
        instructors={(data ?? []).map((i) => ({ id: i.id, fullName: i.full_name }))}
      />
    </AdminShell>
  )
}
