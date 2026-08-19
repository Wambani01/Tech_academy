'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FilterPill } from '@/components/ui'
import type { CourseCard } from '@/lib/queries'

const TRACKS = ['All', 'Marketing', 'Design', 'Development', 'Automation'] as const

/**
 * The catalogue's sticky filter row and card grid.
 *
 * Filtering is client-side and instant: pills switch track, the search field
 * filters on keystroke across title, blurb and track. An empty result renders
 * the no-results state, which names the query in quotes.
 */
export function CourseCatalogue({
  courses,
  defaultTrack = 'All',
  showSearch = true,
}: {
  courses: CourseCard[]
  defaultTrack?: string
  showSearch?: boolean
}) {
  const [active, setActive] = useState(defaultTrack)
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = active === 'All' ? courses : courses.filter((c) => c.track === active)
    if (q) {
      list = list.filter((c) =>
        `${c.title} ${c.blurb} ${c.track}`.toLowerCase().includes(q)
      )
    }
    return list
  }, [courses, active, query])

  const trimmed = query.trim()
  const emptyTitle = trimmed
    ? `No programs match “${trimmed}”`
    : `No programs in ${active} yet`

  return (
    <>
      <div className="bg-cream pt-9 sticky top-0 z-5">
        <div className="container-site flex gap-2.5 flex-wrap items-center pb-8 border-b border-line">
          {TRACKS.map((track) => (
            <FilterPill
              key={track}
              active={track === active}
              onClick={() => setActive(track)}
            >
              {track}
            </FilterPill>
          ))}
          {showSearch ? (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs…"
              aria-label="Search programs"
              className="ml-auto w-[220px] max-stack:ml-0 max-stack:w-full box-border px-3.5 py-2.5 rounded-pill border-[1.5px] border-line-strong text-[13.5px] bg-cream text-ink placeholder:text-muted-2 focus:outline-2 focus:outline-amber"
            />
          ) : null}
        </div>
      </div>

      <div className="bg-cream pt-14 pb-24">
        {visible.length === 0 ? (
          <div className="container-site">
            <div className="border-[1.5px] border-dashed border-[rgba(15,32,25,.25)] rounded-3xl px-8 py-16 text-center box-border">
              <div className="font-display font-bold text-[21px] text-ink mb-2.5">
                {emptyTitle}
              </div>
              <div className="text-ui text-muted leading-[1.6] mb-[26px]">
                Try another track, or tell us what you&rsquo;re looking for and we&rsquo;ll point
                you at the right cohort.
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActive('All')
                    setQuery('')
                  }}
                  className="bg-ink text-cream px-6 py-[13px] rounded-md text-ui font-bold cursor-pointer"
                >
                  Show all programs
                </button>
                <Link
                  href="/business"
                  className="border-[1.5px] border-ink text-ink px-6 py-[13px] rounded-md text-ui font-bold"
                >
                  Talk to admissions
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[22px] max-stack:grid-cols-1">
            {visible.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="border-[1.5px] border-ink rounded-3xl p-[26px] flex flex-col bg-cream hover:bg-ink/[.03] transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-micro font-bold tracking-[.05em] uppercase text-ink bg-ink/8 px-2.5 py-[5px] rounded-pill">
                    {course.track}
                  </span>
                  <span className="text-pill text-muted">{course.level}</span>
                </div>
                <div className="font-display text-[19px] font-bold text-ink mb-2.5">
                  {course.title}
                </div>
                <div className="text-[13.5px] text-muted leading-[1.6] mb-[22px] flex-1">
                  {course.blurb}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-line">
                  <span className="text-label text-muted">{course.duration}</span>
                  <span className="text-[13.5px] font-bold text-ink">View Program →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
