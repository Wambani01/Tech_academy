import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { InstructorForm } from '@/components/admin/instructor-form'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { cldUrl } from '@/lib/cloudinary'
import { assetFallback } from '@/lib/content/defaults'

export const metadata = { title: 'New instructor' }

export default async function AddInstructorPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase
    .from('media_assets')
    .select('public_id, filename')
    .order('created_at', { ascending: false })

  return (
    <AdminShell active="/admin/instructors" user={{ fullName: admin.full_name }}>
      <Link href="/admin/instructors" className="text-meta text-muted mb-4 inline-block">
        ← All instructors
      </Link>
      <AdminHeader title="New instructor" subtitle="Shown on the About and course pages." />
      <InstructorForm
        library={(data ?? []).map((m) => ({
          publicId: m.public_id,
          filename: m.filename,
          url: cldUrl(m.public_id, 'thumb') ?? assetFallback(m.public_id),
        }))}
      />
    </AdminShell>
  )
}
