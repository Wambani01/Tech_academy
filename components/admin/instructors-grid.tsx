'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FilterPill } from '@/components/ui'

export type InstructorRow = {
  id: string
  fullName: string
  email: string
  track: string
  roleTitle: string
  bio: string | null
  photoUrl: string | null
}

const TABS = ['All', 'Marketing', 'Design', 'Development', 'Automation'] as const

export function InstructorsGrid({ instructors }: { instructors: InstructorRow[] }) {
  const [active, setActive] = useState<(typeof TABS)[number]>('All')
  const visible =
    active === 'All' ? instructors : instructors.filter((i) => i.track === active)

  return (
    <>
      <div className="flex gap-2.5 mb-[22px] flex-wrap">
        {TABS.map((tab) => (
          <FilterPill key={tab} active={tab === active} onClick={() => setActive(tab)}>
            {tab}
          </FilterPill>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-[rgba(15,32,25,.22)] rounded-3xl px-6 py-14 text-center">
          <div className="font-display font-bold text-lg text-ink mb-2">
            {instructors.length === 0 ? 'No instructors yet' : `Nobody in ${active}`}
          </div>
          <div className="text-[13.5px] text-muted mb-5">
            {instructors.length === 0
              ? 'Add the people who lead your cohorts.'
              : 'Switch track to see the rest of the team.'}
          </div>
          <Link
            href="/admin/instructors/new"
            className="inline-block bg-ink text-cream px-5 py-[11px] rounded-md text-[13.5px] font-bold"
          >
            + New instructor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {visible.map((person) => (
            <Link
              key={person.id}
              href={`/admin/instructors/${person.id}`}
              className="bg-white border border-line rounded-3xl p-5 block"
            >
              <div
                className="h-[140px] rounded-xl mb-4 bg-cover bg-center bg-ink/8"
                style={
                  person.photoUrl ? { backgroundImage: `url('${person.photoUrl}')` } : undefined
                }
              />
              <div className="text-body font-bold text-ink">{person.fullName}</div>
              <div className="text-label text-muted mb-2">
                {person.roleTitle} · {person.track}
              </div>
              {person.bio ? (
                <div className="text-pill text-muted-2 leading-[1.5] line-clamp-3">
                  {person.bio}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
