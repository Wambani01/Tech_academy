'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill, toneFor } from '@/components/ui'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import { TableHead, TableRow } from '@/components/admin/table'
import { deleteCourse } from '@/lib/admin-actions'
import { formatKes } from '@/lib/format'

export type AdminCourseRow = {
  id: string
  slug: string
  title: string
  track: string
  level: string
  priceKes: number
  status: string
  enrolled: number
}

const TABS = ['All', 'Marketing', 'Design', 'Development', 'Automation'] as const
const COLUMNS = 'minmax(0,2fr) 120px 110px 120px 110px 150px'

export function CoursesManager({ courses }: { courses: AdminCourseRow[] }) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>('All')
  const [pending, setPending] = useState<AdminCourseRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(
    () => (active === 'All' ? courses : courses.filter((c) => c.track === active)),
    [courses, active]
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
              labels={['Course', 'Track', 'Level', 'Price', 'Status', 'Actions']}
            />
            {visible.length === 0 ? (
              <div className="px-[22px] py-16 text-center">
                <div className="font-display font-bold text-[17px] text-ink mb-1.5">
                  {courses.length === 0 ? 'No courses yet' : `Nothing in ${active}`}
                </div>
                <div className="text-[13.5px] text-muted">
                  {courses.length === 0
                    ? 'Publish your first program to open enrolment.'
                    : 'No published or draft courses sit in this track yet.'}
                </div>
              </div>
            ) : (
              visible.map((course, i) => (
                <TableRow key={course.id} columns={COLUMNS} last={i === visible.length - 1}>
                  <div className="min-w-0">
                    <div className="text-ui font-semibold text-ink truncate">{course.title}</div>
                    <div className="text-pill text-muted-2">
                      {course.enrolled} enrolled
                    </div>
                  </div>
                  <div className="text-meta text-muted">{course.track}</div>
                  <div className="text-meta text-muted">{course.level}</div>
                  <div className="text-meta text-muted">{formatKes(course.priceKes)}</div>
                  <div>
                    <StatusPill tone={toneFor(course.status)}>
                      {course.status === 'published' ? 'Published' : course.status === 'draft' ? 'Draft' : 'Archived'}
                    </StatusPill>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-meta font-bold text-ink"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/content`}
                      className="text-meta font-bold text-muted"
                    >
                      Content
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPending(course)}
                      className="text-meta font-bold text-amber-deep cursor-pointer"
                    >
                      Delete
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
        title="Delete this course?"
        actions={
          <ConfirmActions
            keepLabel="Keep course"
            confirmLabel="Delete course"
            busy={busy}
            onKeep={() => setPending(null)}
            onConfirm={async () => {
              if (!pending) return
              setBusy(true)
              setError(null)
              const result = await deleteCourse(pending.id)
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
        {pending && pending.enrolled > 0
          ? `${pending.enrolled} enrolled student${
              pending.enrolled === 1 ? '' : 's'
            } will lose access immediately.`
          : 'This course has no enrolments, so nothing else is affected.'}
      </Modal>
    </>
  )
}
