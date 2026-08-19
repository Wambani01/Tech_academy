import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { InstructorForm } from '@/components/admin/instructor-form'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { cldUrl } from '@/lib/cloudinary'
import { assetFallback } from '@/lib/content/defaults'

export const metadata = { title: 'Edit instructor' }

export default async function EditInstructorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: instructor }, { data: assets }] = await Promise.all([
    supabase
      .from('instructors')
      .select('id, full_name, email, track, role_title, bio, photo_id')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('media_assets').select('public_id, filename').order('created_at', {
      ascending: false,
    }),
  ])

  if (!instructor) notFound()

  return (
    <AdminShell active="/admin/instructors" user={{ fullName: admin.full_name }}>
      <Link href="/admin/instructors" className="text-meta text-muted mb-4 inline-block">
        ← All instructors
      </Link>
      <AdminHeader title={instructor.full_name} subtitle={`${instructor.role_title} · ${instructor.track}`} />
      <InstructorForm
        initial={{
          id: instructor.id,
          fullName: instructor.full_name,
          email: instructor.email,
          track: instructor.track,
          roleTitle: instructor.role_title,
          bio: instructor.bio ?? '',
          photoId: instructor.photo_id,
        }}
        library={(assets ?? []).map((m) => ({
          publicId: m.public_id,
          filename: m.filename,
          url: cldUrl(m.public_id, 'thumb') ?? assetFallback(m.public_id),
        }))}
      />
    </AdminShell>
  )
}
