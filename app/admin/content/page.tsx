import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { ContentIndex, type ContentRow } from '@/components/admin/content-index'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { relativeTime } from '@/lib/format'

export const metadata = { title: 'Website Content' }

export default async function ManageContentPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: pages }, { data: faqs }, { data: instructors }] = await Promise.all([
    supabase
      .from('pages')
      .select('slug, title, updated_at, page_blocks(id, draft_fields)')
      .order('slug'),
    supabase.from('faqs').select('id, updated_at').order('updated_at', { ascending: false }),
    supabase.from('instructors').select('id, updated_at').order('updated_at', { ascending: false }),
  ])

  const pageRows: ContentRow[] = (pages ?? []).map((page) => {
    const blocks = (page.page_blocks ?? []) as Array<{ id: string; draft_fields: unknown }>
    return {
      key: page.slug,
      title: page.title,
      path: page.slug === 'home' ? '/' : `/${page.slug}`,
      group: 'Pages',
      blocks: blocks.length,
      edited: relativeTime(page.updated_at),
      hasDraft: blocks.some((b) => b.draft_fields !== null),
      editHref: `/admin/content/${page.slug}`,
      viewHref: page.slug === 'home' ? '/' : `/${page.slug}`,
    }
  })

  const collectionRows: ContentRow[] = [
    {
      key: 'faqs',
      title: 'FAQs',
      path: `${faqs?.length ?? 0} questions · homepage`,
      group: 'Collections',
      blocks: faqs?.length ?? 0,
      edited: faqs?.[0] ? relativeTime(faqs[0].updated_at) : '—',
      hasDraft: false,
      editHref: '/admin/faqs',
      viewHref: '/',
    },
    {
      key: 'instructors',
      title: 'Instructor bios',
      path: `${instructors?.length ?? 0} records · about & course pages`,
      group: 'Collections',
      blocks: instructors?.length ?? 0,
      edited: instructors?.[0] ? relativeTime(instructors[0].updated_at) : '—',
      hasDraft: false,
      editHref: '/admin/instructors',
      viewHref: '/about',
    },
  ]

  const rows = [...pageRows, ...collectionRows]

  return (
    <AdminShell active="/admin/content" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Website Content"
        subtitle="Edit the copy and imagery on every public page."
        action={
          <Link
            href="/admin/media"
            className="border-[1.5px] border-ink text-ink px-[22px] py-[13px] rounded-md text-ui font-bold whitespace-nowrap"
          >
            Open Media Library
          </Link>
        }
      />
      <ContentIndex rows={rows} />
    </AdminShell>
  )
}
