import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { EventForm } from '@/components/admin/event-form'
import { requireAdmin } from '@/lib/student'

export const metadata = { title: 'New event' }

export default async function AddEventPage() {
  const admin = await requireAdmin()
  return (
    <AdminShell active="/admin/events" user={{ fullName: admin.full_name }}>
      <Link href="/admin/events" className="text-meta text-muted mb-4 inline-block">
        ← All events
      </Link>
      <AdminHeader title="New event" subtitle="It goes live on the events page once saved." />
      <EventForm />
    </AdminShell>
  )
}
