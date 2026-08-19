'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill, toneFor } from '@/components/ui'
import { TableHead, TableRow } from '@/components/admin/table'
import { enrolStudent, setEnquiryStatus } from '@/lib/admin-actions'
import { formatShortDate } from '@/lib/format'
import type { EnquiryStatus } from '@/types/database'

export type EnquiryRow = {
  id: string
  fullName: string
  email: string
  phone: string | null
  message: string | null
  courseTitle: string | null
  courseId: string | null
  profileId: string | null
  status: EnquiryStatus
  createdAt: string
}

const TABS = ['New', 'Contacted', 'Enrolled', 'Closed', 'All'] as const
const COLUMNS = 'minmax(0,1.5fr) minmax(0,1.4fr) minmax(0,1.2fr) 110px 110px 190px'

const LABEL: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  enrolled: 'Enrolled',
  closed: 'Closed',
}

/** The v1 enquiry inbox: status workflow plus manual enrolment. */
export function EnquiriesInbox({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>('New')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(
    () =>
      active === 'All'
        ? enquiries
        : enquiries.filter((e) => LABEL[e.status] === active),
    [enquiries, active]
  )

  async function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setBusy(true)
    setError(null)
    const result = await fn()
    setBusy(false)
    if (!result.ok) setError(result.error)
    else router.refresh()
  }

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
          <div style={{ minWidth: 960 }}>
            <TableHead
              columns={COLUMNS}
              labels={['Name', 'Email', 'Programme', 'Received', 'Status', 'Actions']}
            />
            {visible.length === 0 ? (
              <div className="px-[22px] py-16 text-center">
                <div className="font-display font-bold text-[17px] text-ink mb-1.5">
                  {enquiries.length === 0 ? 'No enquiries yet' : `Nothing ${active.toLowerCase()}`}
                </div>
                <div className="text-[13.5px] text-muted">
                  {enquiries.length === 0
                    ? 'Requests from the course pages land here.'
                    : 'Switch tabs to see the rest of the inbox.'}
                </div>
              </div>
            ) : (
              visible.map((row, i) => (
                <div key={row.id}>
                  <TableRow columns={COLUMNS} last={i === visible.length - 1 && expanded !== row.id}>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                      className="text-left min-w-0 cursor-pointer"
                      aria-expanded={expanded === row.id}
                    >
                      <div className="text-ui font-semibold text-ink truncate">{row.fullName}</div>
                      {row.phone ? (
                        <div className="text-pill text-muted-2">{row.phone}</div>
                      ) : null}
                    </button>
                    <div className="text-meta text-muted min-w-0 truncate">
                      <a href={`mailto:${row.email}`}>{row.email}</a>
                    </div>
                    <div className="text-meta text-muted min-w-0 truncate">
                      {row.courseTitle ?? 'General'}
                    </div>
                    <div className="text-meta text-muted">{formatShortDate(row.createdAt)}</div>
                    <div>
                      <StatusPill tone={toneFor(row.status)}>{LABEL[row.status]}</StatusPill>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {row.status === 'new' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => run(() => setEnquiryStatus(row.id, 'contacted'))}
                          className="text-meta font-bold text-ink cursor-pointer"
                        >
                          Mark contacted
                        </button>
                      ) : null}
                      {row.profileId && row.courseId && row.status !== 'enrolled' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(() => enrolStudent(row.profileId!, row.courseId!, row.id))
                          }
                          className="text-meta font-bold text-forest cursor-pointer"
                        >
                          Enrol
                        </button>
                      ) : null}
                      {row.status !== 'closed' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => run(() => setEnquiryStatus(row.id, 'closed'))}
                          className="text-meta font-bold text-muted cursor-pointer"
                        >
                          Close
                        </button>
                      ) : null}
                    </div>
                  </TableRow>

                  {expanded === row.id ? (
                    <div className="px-[22px] py-4 bg-paper border-b border-line-soft">
                      <div className="text-label font-bold tracking-[.05em] uppercase text-muted mb-2">
                        Message
                      </div>
                      <div className="text-ui text-body-soft leading-[1.6] max-w-[720px]">
                        {row.message || 'They did not leave a message.'}
                      </div>
                      {!row.profileId ? (
                        <div className="text-micro text-muted-2 mt-3">
                          No account is linked to this enquiry yet — they need to sign up with{' '}
                          {row.email} before you can enrol them.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
