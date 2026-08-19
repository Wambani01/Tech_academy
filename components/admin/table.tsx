import type { ReactNode } from 'react'
import { cx } from '@/lib/format'

/**
 * Admin table primitives.
 *
 * Wide tables scroll horizontally rather than squash below 860px, so the grid
 * template sits on an inner element with a min-width.
 */
export function AdminTable({
  columns,
  minWidth = 760,
  children,
}: {
  columns: string
  minWidth?: number
  children: ReactNode
}) {
  return (
    <div className="bg-card border border-line rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth }} data-grid={columns}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function TableHead({
  columns,
  labels,
}: {
  columns: string
  labels: ReactNode[]
}) {
  return (
    <div
      className="grid gap-x-[18px] px-[22px] py-3.5 text-pill font-bold tracking-[.05em] uppercase text-muted border-b border-line-soft"
      style={{ gridTemplateColumns: columns }}
    >
      {labels.map((label, i) => (
        <div key={i}>{label}</div>
      ))}
    </div>
  )
}

export function TableRow({
  columns,
  last,
  className,
  children,
}: {
  columns: string
  last?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'grid gap-x-[18px] px-[22px] py-4 items-center',
        last ? '' : 'border-b border-line-soft',
        className
      )}
      style={{ gridTemplateColumns: columns }}
    >
      {children}
    </div>
  )
}

/** The row-level Edit / … / Delete link group. */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 flex-wrap">{children}</div>
}
