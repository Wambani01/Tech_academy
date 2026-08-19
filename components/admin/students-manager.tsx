'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill, toneFor } from '@/components/ui'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import { TableHead, TableRow } from '@/components/admin/table'
import { removeStudent } from '@/lib/admin-actions'
import { formatShortDate } from '@/lib/format'

export type StudentRow = {
  id: string
  fullName: string
  email: string
  track: string | null
  courses: number
  status: 'Active' | 'Completed' | 'Inactive'
  joined: string
}

const TABS = ['All', 'Active', 'Completed', 'Inactive'] as const
const COLUMNS = 'minmax(0,1.6fr) minmax(0,1.4fr) 110px 90px 110px 110px'

/** Live search across name and email, status tabs, and Remove with a modal. */
export function StudentsManager({ students }: { students: StudentRow[] }) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>('All')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<StudentRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = active === 'All' ? students : students.filter((s) => s.status === active)
    if (q) list = list.filter((s) => `${s.fullName} ${s.email}`.toLowerCase().includes(q))
    return list
  }, [students, active, query])

  const trimmed = query.trim()
  const emptyTitle =
    students.length === 0
      ? 'No students yet'
      : trimmed
        ? `No students match “${trimmed}”`
        : `No ${active.toLowerCase()} students`
  const emptyBody =
    students.length === 0
      ? 'Enrolments will appear here as soon as students join a cohort.'
      : 'Try a different search term or switch tabs.'

  return (
    <>
      <div className="flex justify-between items-center gap-3 mb-[22px] flex-wrap">
        <div className="flex gap-2.5 flex-wrap">
          {TABS.map((tab) => (
            <FilterPill key={tab} active={tab === active} onClick={() => setActive(tab)}>
              {tab}
            </FilterPill>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          aria-label="Search students"
          className="w-[220px] box-border px-4 py-3 rounded-md border-[1.5px] border-line-strong text-ui bg-white focus:outline-2 focus:outline-amber"
        />
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
              labels={['Student', 'Email', 'Track', 'Courses', 'Status', 'Actions']}
            />
            {visible.length === 0 ? (
              <div className="px-[22px] py-16 text-center">
                <div className="font-display font-bold text-[17px] text-ink mb-1.5">
                  {emptyTitle}
                </div>
                <div className="text-[13.5px] text-muted">{emptyBody}</div>
              </div>
            ) : (
              visible.map((student, i) => (
                <TableRow key={student.id} columns={COLUMNS} last={i === visible.length - 1}>
                  <div className="min-w-0">
                    <div className="text-ui font-semibold text-ink truncate">
                      {student.fullName}
                    </div>
                    <div className="text-pill text-muted-2">
                      Joined {formatShortDate(student.joined)}
                    </div>
                  </div>
                  <div className="text-meta text-muted min-w-0 truncate">{student.email}</div>
                  <div className="text-meta text-muted">{student.track ?? '—'}</div>
                  <div className="text-meta text-muted">{student.courses}</div>
                  <div>
                    <StatusPill tone={toneFor(student.status.toLowerCase())}>
                      {student.status}
                    </StatusPill>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setPending(student)}
                      className="text-meta font-bold text-amber-deep cursor-pointer"
                    >
                      Remove
                    </button>
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
        title={`Remove ${pending?.fullName ?? ''}?`}
        actions={
          <ConfirmActions
            keepLabel="Keep student"
            confirmLabel="Remove student"
            busy={busy}
            onKeep={() => setPending(null)}
            onConfirm={async () => {
              if (!pending) return
              setBusy(true)
              setError(null)
              const result = await removeStudent(pending.id)
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
        Their enrolments and progress will be archived. This can&rsquo;t be undone from the
        console.
      </Modal>
    </>
  )
}
