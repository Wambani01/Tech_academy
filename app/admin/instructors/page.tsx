import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { InstructorsGrid, type InstructorRow } from '@/components/admin/instructors-grid'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { cldUrl } from '@/lib/cloudinary'
import { assetFallback } from '@/lib/content/defaults'

export const metadata = { title: 'Instructors' }

export default async function ManageInstructorsPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('instructors')
    .select('id, full_name, email, track, role_title, bio, photo_id')
    .order('position')

  const instructors: InstructorRow[] = (data ?? []).map((i) => ({
    id: i.id,
    fullName: i.full_name,
    email: i.email,
    track: i.track,
    roleTitle: i.role_title,
    bio: i.bio,
    photoUrl: cldUrl(i.photo_id, 'portrait') ?? assetFallback(i.photo_id),
  }))

  return (
    <AdminShell active="/admin/instructors" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Instructors"
        subtitle="The people who lead cohorts, shown on the About and course pages."
        action={
          <Link
            href="/admin/instructors/new"
            className="bg-ink text-cream px-[22px] py-[13px] rounded-md text-ui font-bold whitespace-nowrap"
          >
            + New instructor
          </Link>
        }
      />
      <InstructorsGrid instructors={instructors} />
    </AdminShell>
  )
}
