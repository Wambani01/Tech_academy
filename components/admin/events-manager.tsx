'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill, toneFor } from '@/components/ui'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import { TableHead, TableRow } from '@/components/admin/table'
import { cancelEvent } from '@/lib/admin-actions'
import { formatShortDate, formatTime } from '@/lib/format'

export type AdminEventRow = {
  id: string
  title: string
  track: string
  format: string
  startsAt: string
  capacity: number | null
  registrants: number
  status: string
}

const TABS = ['Upcoming', 'Past'] as const
const COLUMNS = 'minmax(0,2fr) 120px 150px 120px 110px 110px'

export function EventsManager({ events }: { events: AdminEventRow[] }) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>('Upcoming')
  const [pending, setPending] = useState<AdminEventRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(
    () =>
      events.filter((e) =>
        active === 'Upcoming' ? e.status === 'upcoming' : e.status !== 'upcoming'
      ),
    [events, active]
  )

  return (
    <>
      <div className="flex gap-2.5 mb-[22px] flex-wrap">
        {TABS.map((tab) => (
          <FilterPill key={tab} active={tab === active} onClick={() => setActive(tab)}>
            {tab}
          </FilterPill>
        ))}
      </div>

      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      <div className="bg-card border border-line rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 900 }}>
            <TableHead
              columns={COLUMNS}
              labels={['Event', 'Track', 'When', 'Registrants', 'Status', 'Actions']}
            />
            {visible.length === 0 ? (
              <div className="px-[22px] py-16 text-center">
                <div className="font-display font-bold text-[17px] text-ink mb-1.5">
                  {active === 'Upcoming' ? 'Nothing scheduled' : 'No past events'}
                </div>
                <div className="text-[13.5px] text-muted">
                  {active === 'Upcoming'
                    ? 'Add a masterclass to open registrations.'
                    : 'Sessions move here once their date passes.'}
                </div>
              </div>
            ) : (
              visible.map((event, i) => (
                <TableRow key={event.id} columns={COLUMNS} last={i === visible.length - 1}>
                  <div className="min-w-0">
                    <div className="text-ui font-semibold text-ink truncate">{event.title}</div>
                    <div className="text-pill text-muted-2">{event.format}</div>
                  </div>
                  <div className="text-meta text-muted">{event.track}</div>
                  <div className="text-meta text-muted">
                    {formatShortDate(event.startsAt)} · {formatTime(event.startsAt)}
                  </div>
                  <div className="text-meta text-muted">
                    {event.registrants}
                    {event.capacity ? ` / ${event.capacity}` : ''}
                  </div>
                  <div>
                    <StatusPill tone={toneFor(event.status)}>
                      {event.status === 'upcoming'
                        ? 'Upcoming'
                        : event.status === 'cancelled'
                          ? 'Cancelled'
                          : 'Past'}
                    </StatusPill>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Link href={`/admin/events/${event.id}`} className="text-meta font-bold text-ink">
                      Edit
                    </Link>
                    {event.status === 'upcoming' ? (
                      <button
                        type="button"
                        onClick={() => setPending(event)}
                        className="text-meta font-bold text-amber-deep cursor-pointer"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </TableRow>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Cancel this event?"
        actions={
          <ConfirmActions
            keepLabel="Keep event"
            confirmLabel="Cancel event"
            busy={busy}
            onKeep={() => setPending(null)}
            onConfirm={async () => {
              if (!pending) return
              setBusy(true)
              setError(null)
              const result = await cancelEvent(pending.id)
              setBusy(false)
              if (!result.ok) setError(result.error)
              else {
                setPending(null)
                router.refresh()
              }
            }}
          />
        }
      >
        <strong className="text-ink">{pending?.title}</strong>
        <br />
        <br />
        {pending && pending.registrants > 0
          ? `All ${pending.registrants} registrant${
              pending.registrants === 1 ? '' : 's'
            } will be emailed automatically.`
          : 'Nobody has registered yet, so no one will be notified.'}
      </Modal>
    </>
  )
}
