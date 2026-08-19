import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { StudentsManager, type StudentRow } from '@/components/admin/students-manager'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Students' }

export default async function ManageStudentsPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: profiles }, { data: enrolments }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, track, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false }),
    supabase.from('enrollments').select('profile_id, status'),
  ])

  const byProfile = new Map<string, Array<{ status: string }>>()
  for (const row of enrolments ?? []) {
    const list = byProfile.get(row.profile_id) ?? []
    list.push({ status: row.status })
    byProfile.set(row.profile_id, list)
  }

  const students: StudentRow[] = (profiles ?? []).map((p) => {
    const rows = byProfile.get(p.id) ?? []
    const status: StudentRow['status'] = rows.some((r) => r.status === 'active')
      ? 'Active'
      : rows.some((r) => r.status === 'completed')
        ? 'Completed'
        : 'Inactive'
    return {
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      track: p.track,
      courses: rows.filter((r) => r.status !== 'cancelled').length,
      status,
      joined: p.created_at,
    }
  })

  return (
    <AdminShell active="/admin/students" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Students"
        subtitle="Everyone with an account, and what they are enrolled in."
      />
      <StudentsManager students={students} />
    </AdminShell>
  )
}
