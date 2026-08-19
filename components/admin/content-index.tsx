'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill } from '@/components/ui'
import { TableHead, TableRow } from '@/components/admin/table'
import { publishAllPages } from '@/lib/cms/actions'

const TABS = ['All', 'Pages', 'Collections', 'Global'] as const

export type ContentRow = {
  key: string
  title: string
  path: string
  group: 'Pages' | 'Collections' | 'Global'
  blocks: number
  edited: string
  hasDraft: boolean
  editHref: string
  viewHref: string
}

const COLUMNS = 'minmax(0,1.8fr) 90px minmax(0,1fr) 130px 150px'

/**
 * The content index. Rows route to the page editor or, for a collection, to the
 * manager that owns it. The draft banner names the pages carrying unpublished
 * edits and publishes them in one action.
 */
export function ContentIndex({ rows }: { rows: ContentRow[] }) {
  const router = useRouter()
  const [active, setActive] = useState<(typeof TABS)[number]>('All')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(
    () => (active === 'All' ? rows : rows.filter((r) => r.group === active)),
    [rows, active]
  )

  const drafts = rows.filter((r) => r.hasDraft)

  const notice =
    drafts.length === 1
      ? `1 page has unpublished changes: ${drafts[0]!.title}.`
      : `${drafts.length} pages have unpublished changes: ${drafts.map((d) => d.title).join(', ')}.`

  async function onPublishAll() {
    setBusy(true)
    setError(null)
    const result = await publishAllPages()
    setBusy(false)
    if (!result.ok) setError(result.error)
    else router.refresh()
  }

  return (
    <>
      {drafts.length > 0 ? (
        <div className="flex items-center gap-4 bg-amber/14 border border-[rgba(181,116,26,.3)] rounded-2xl px-5 py-4 mb-6 flex-wrap">
          <div className="text-[13.5px] text-[#5C4318] leading-[1.5] flex-1 min-w-[220px]">
            {notice}
          </div>
          <button
            type="button"
            onClick={onPublishAll}
            disabled={busy}
            className="bg-ink text-cream px-[18px] py-[11px] rounded-md text-meta font-bold cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {busy ? 'Publishing…' : 'Publish all'}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      <div className="flex gap-2.5 mb-[22px] flex-wrap">
        {TABS.map((tab) => (
          <FilterPill key={tab} active={tab === active} onClick={() => setActive(tab)}>
            {tab}
          </FilterPill>
        ))}
      </div>

      <div className="bg-card border border-line rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 760 }}>
            <TableHead
              columns={COLUMNS}
              labels={['Page', 'Blocks', 'Last edited', 'Status', 'Actions']}
            />
            {visible.length === 0 ? (
              <div className="px-[22px] py-16 text-center">
                <div className="font-display font-bold text-[17px] text-ink mb-1.5">
                  No pages in {active}
                </div>
                <div className="text-[13.5px] text-muted">
                  Switch tabs to see the rest of the site.
                </div>
              </div>
            ) : (
              visible.map((row, i) => (
                <TableRow key={row.key} columns={COLUMNS} last={i === visible.length - 1}>
                  <div className="min-w-0">
                    <div className="text-ui font-semibold text-ink">{row.title}</div>
                    <div className="text-pill text-muted-2 truncate">{row.path}</div>
                  </div>
                  <div className="text-meta text-muted">{row.blocks}</div>
                  <div className="text-meta text-muted min-w-0 truncate">{row.edited}</div>
                  <div>
                    <StatusPill tone={row.hasDraft ? 'pending' : 'live'}>
                      {row.hasDraft ? 'Draft changes' : 'Published'}
                    </StatusPill>
                  </div>
                  <div className="flex gap-3">
                    <Link href={row.editHref} className="text-meta font-bold text-ink">
                      Edit
                    </Link>
                    <Link href={row.viewHref} className="text-meta font-bold text-muted">
                      View
                    </Link>
                  </div>
                </TableRow>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
