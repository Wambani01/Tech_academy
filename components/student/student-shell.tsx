import Link from 'next/link'
import { initials } from '@/lib/format'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn', label: 'My Courses' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/settings', label: 'Profile' },
] as const

export type StudentNavKey = (typeof NAV)[number]['href']

export type StudentUser = { fullName: string; track: string | null }

/**
 * The student shell: a 240px sticky sidebar that becomes a horizontal top bar
 * under 860px, with "← Exit to site" and the user chip pinned to the bottom.
 */
export function StudentShell({
  active,
  user,
  children,
  wide = false,
}: {
  active: StudentNavKey
  user: StudentUser
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="flex min-h-screen max-stack:flex-col bg-paper">
      <aside className="w-sidebar-student flex-none bg-ink text-cream px-[18px] py-7 flex flex-col sticky top-0 h-screen box-border max-stack:w-full max-stack:h-auto max-stack:static max-stack:flex-row max-stack:flex-wrap max-stack:items-center max-stack:gap-[8px_14px] max-stack:px-[18px] max-stack:py-4">
        <Link
          href="/"
          className="font-display font-bold text-[16.5px] text-cream px-2.5 pb-8 block max-stack:p-0"
        >
          TECH LAB ACADEMY
        </Link>
        <nav className="flex flex-col gap-0.5 max-stack:flex-row max-stack:flex-wrap max-stack:gap-1.5">
          {NAV.map((item) => {
            const isActive = active === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-[11px] rounded-lg text-ui ${
                  isActive ? 'bg-amber text-ink font-bold' : 'text-on-ink-2 font-medium hover:bg-cream/5'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex-1 max-stack:hidden" />
        <Link
          href="/"
          className="text-label text-on-ink-3 px-2.5 pb-3 block max-stack:hidden"
        >
          ← Exit to site
        </Link>
        <div className="flex items-center gap-2.5 p-3 border-t border-[rgba(244,251,232,.1)] max-stack:hidden">
          <div className="w-[34px] h-[34px] rounded-full bg-amber text-ink text-meta font-bold flex items-center justify-center flex-none">
            {initials(user.fullName)}
          </div>
          <div className="min-w-0">
            <div className="text-meta font-bold text-cream truncate">{user.fullName}</div>
            <div className="text-micro text-on-ink-3 truncate">
              {user.track ? `${user.track} Track` : 'Student'}
            </div>
          </div>
        </div>
      </aside>

      <main
        className={`flex-1 min-w-0 px-12 py-11 max-stack:px-5 max-stack:py-7 ${
          wide ? 'max-w-[1400px]' : 'max-w-[1160px]'
        }`}
      >
        {children}
      </main>
    </div>
  )
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display font-bold text-admin-title text-ink mb-1">{children}</div>
  )
}

export function PageSubtitle({ children }: { children: React.ReactNode }) {
  return <div className="text-body text-muted mb-9">{children}</div>
}

/** The amber progress bar used on course cards and the certificates list. */
export function ProgressBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div
      className={`h-[7px] bg-ink/10 rounded-pill overflow-hidden ${className ?? ''}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-amber" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

export function StatCard({ figure, label }: { figure: string | number; label: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <div className="font-display font-bold text-[26px] text-ink">{figure}</div>
      <div className="text-label text-muted mt-1">{label}</div>
    </div>
  )
}
