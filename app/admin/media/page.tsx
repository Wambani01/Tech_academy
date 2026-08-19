import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { MediaLibrary, type MediaRow } from '@/components/admin/media-library'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { cldUrl } from '@/lib/cloudinary'
import { assetFallback } from '@/lib/content/defaults'

export const metadata = { title: 'Media' }

export default async function MediaLibraryPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: assets }, { data: usage }] = await Promise.all([
    supabase
      .from('media_assets')
      .select('id, public_id, filename, folder, width, height, bytes, alt')
      .order('created_at', { ascending: false }),
    supabase.from('page_blocks').select('image_id, pages(title)').not('image_id', 'is', null),
  ])

  const usedOn = new Map<string, string[]>()
  for (const row of usage ?? []) {
    if (!row.image_id) continue
    const title = (row.pages as { title: string } | null)?.title
    if (!title) continue
    const list = usedOn.get(row.image_id) ?? []
    if (!list.includes(title)) list.push(title)
    usedOn.set(row.image_id, list)
  }

  const rows: MediaRow[] = (assets ?? []).map((a) => ({
    id: a.id,
    publicId: a.public_id,
    filename: a.filename,
    folder: a.folder,
    width: a.width,
    height: a.height,
    bytes: a.bytes,
    alt: a.alt,
    url: cldUrl(a.public_id, 'card') ?? assetFallback(a.public_id),
    usedOn: usedOn.get(a.id) ?? [],
  }))

  return (
    <AdminShell active="/admin/media" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Media Library"
        subtitle="Every image the site uses, and which pages reference it."
      />
      <MediaLibrary assets={rows} />
    </AdminShell>
  )
}
