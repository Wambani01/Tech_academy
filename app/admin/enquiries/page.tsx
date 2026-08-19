import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { EnquiriesInbox, type EnquiryRow } from '@/components/admin/enquiries-inbox'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Enquiries' }

export default async function EnquiriesPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('enquiries')
    .select('id, full_name, email, phone, message, status, created_at, course_id, profile_id, courses(title)')
    .order('created_at', { ascending: false })

  // An enquiry links to an account when one already exists for that address.
  const emails = Array.from(new Set((data ?? []).map((e) => e.email)))
  const { data: profiles } = emails.length
    ? await supabase.from('profiles').select('id, email').in('email', emails)
    : { data: [] as Array<{ id: string; email: string }> }

  const byEmail = new Map((profiles ?? []).map((p) => [p.email, p.id] as const))

  const rows: EnquiryRow[] = (data ?? []).map((e) => ({
    id: e.id,
    fullName: e.full_name,
    email: e.email,
    phone: e.phone,
    message: e.message,
    courseTitle: (e.courses as { title: string } | null)?.title ?? null,
    courseId: e.course_id,
    profileId: e.profile_id ?? byEmail.get(e.email) ?? null,
    status: e.status,
    createdAt: e.created_at,
  }))

  const open = rows.filter((r) => r.status === 'new' || r.status === 'contacted').length

  return (
    <AdminShell active="/admin/enquiries" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Enquiries"
        subtitle={`${open} open · requests from the course pages, before payments land in v2.`}
      />
      <EnquiriesInbox enquiries={rows} />
    </AdminShell>
  )
}
