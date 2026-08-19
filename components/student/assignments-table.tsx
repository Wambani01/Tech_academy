'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill, toneFor } from '@/components/ui'

const TABS = ['All', 'Pending', 'Submitted', 'Graded'] as const

export type AssignmentRow = {
  id: string
  title: string
  course: string
  due: string
  status: 'Pending' | 'Submitted' | 'Graded'
  score: number | null
}

/** Status tabs, table and a per-tab empty state. */
export function AssignmentsTable({ rows }: { rows: AssignmentRow[] }) {
  const [active, setActive] = useState<(typeof TABS)[number]>('All')

  const visible = useMemo(
    () => (active === 'All' ? rows : rows.filter((r) => r.status === active)),
    [rows, active]
  )

  const emptyTitle = rows.length === 0 ? 'No assignments yet' : `Nothing ${active.toLowerCase()}`
  const emptyBody =
    rows.length === 0
      ? 'Briefs appear here once your cohort reaches its first project.'
      : 'Switch tabs to see the rest of your coursework.'

  const cols =
    'grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_62px_128px] gap-x-[18px] max-stack:grid-cols-[minmax(0,2fr)_80px_128px]'

  return (
    <>
      <div className="flex gap-2.5 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <FilterPill key={tab} active={tab === active} onClick={() => setActive(tab)}>
            {tab}
          </FilterPill>
        ))}
      </div>

      <div className="bg-white border border-line rounded-3xl overflow-hidden">
        <div
          className={`${cols} px-[22px] py-3.5 text-pill font-bold tracking-[.05em] uppercase text-muted border-b border-line-soft`}
        >
          <div>Assignment</div>
          <div className="max-stack:hidden">Course</div>
          <div>Due</div>
          <div>Status</div>
        </div>

        {visible.length === 0 ? (
          <div className="px-[22px] py-16 text-center">
            <div className="font-display font-bold text-[17px] text-ink mb-1.5">{emptyTitle}</div>
            <div className="text-[13.5px] text-muted mb-5">{emptyBody}</div>
            <Link
              href="/dashboard"
              className="inline-block border-[1.5px] border-ink text-ink px-5 py-[11px] rounded-md text-[13.5px] font-bold"
            >
              Back to my courses
            </Link>
          </div>
        ) : (
          visible.map((row, i) => (
            <div
              key={row.id}
              className={`${cols} px-[22px] py-[18px] items-center ${
                i === visible.length - 1 ? '' : 'border-b border-line-soft'
              }`}
            >
              <div className="text-ui font-semibold text-ink">{row.title}</div>
              <div className="text-meta text-muted max-stack:hidden">{row.course}</div>
              <div className="text-meta text-muted">{row.due}</div>
              <div>
                <StatusPill tone={toneFor(row.status.toLowerCase())}>
                  {row.status === 'Graded' && row.score !== null
                    ? `Graded · ${row.score}/100`
                    : row.status}
                </StatusPill>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
