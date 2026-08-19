import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { EventsManager, type AdminEventRow } from '@/components/admin/events-manager'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Events' }

export default async function ManageEventsPage() {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: events }, { data: registrations }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, track, format, starts_at, capacity, status')
      .order('starts_at', { ascending: false }),
    supabase.from('registrations').select('event_id'),
  ])

  const counts = new Map<string, number>()
  for (const row of registrations ?? []) {
    counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1)
  }

  const rows: AdminEventRow[] = (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    track: e.track,
    format: e.format,
    startsAt: e.starts_at,
    capacity: e.capacity,
    registrants: counts.get(e.id) ?? 0,
    status: e.status,
  }))

  return (
    <AdminShell active="/admin/events" user={{ fullName: admin.full_name }}>
      <AdminHeader
        title="Events"
        subtitle="Masterclasses and workshops, upcoming and past."
        action={
          <Link
            href="/admin/events/new"
            className="bg-ink text-cream px-[22px] py-[13px] rounded-md text-ui font-bold whitespace-nowrap"
          >
            + New event
          </Link>
        }
      />
      <EventsManager events={rows} />
    </AdminShell>
  )
}
