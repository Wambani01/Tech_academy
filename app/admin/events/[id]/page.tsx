import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { EventForm } from '@/components/admin/event-form'
import { requireAdmin } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Edit event' }

/** `datetime-local` wants `YYYY-MM-DDTHH:mm` in Nairobi time. */
function toLocalInput(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin()
  const supabase = await createClient()

  const [{ data: event }, { count }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, track, format, starts_at, capacity, description, status')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', id),
  ])

  if (!event) notFound()

  return (
    <AdminShell active="/admin/events" user={{ fullName: admin.full_name }}>
      <Link href="/admin/events" className="text-meta text-muted mb-4 inline-block">
        ← All events
      </Link>
      <AdminHeader
        title={event.title}
        subtitle={`${count ?? 0} registered${event.status === 'cancelled' ? ' · cancelled' : ''}`}
      />
      <EventForm
        initial={{
          id: event.id,
          title: event.title,
          track: event.track,
          format: event.format,
          startsAt: toLocalInput(event.starts_at),
          capacity: event.capacity,
          description: event.description ?? '',
        }}
        registrants={count ?? 0}
        cancelled={event.status === 'cancelled'}
      />
    </AdminShell>
  )
}
