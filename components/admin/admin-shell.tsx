import Link from 'next/link'
import { initials } from '@/lib/format'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/content', label: 'Website Content' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/instructors', label: 'Instructors' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/enquiries', label: 'Enquiries' },
] as const

export type AdminNavKey = (typeof NAV)[number]['href']

/**
 * The admin shell: a 230px dark sidebar in the handoff's nav order, the active
 * item amber with dark text, "Exit to site" and the user chip pinned to the
 * bottom. Collapses to a horizontal top bar at 860px.
 */
export function AdminShell({
  active,
  user,
  children,
}: {
  active: AdminNavKey
  user: { fullName: string }
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen max-stack:flex-col bg-paper">
      <aside className="w-sidebar-admin flex-none bg-ink text-cream px-[18px] py-7 flex flex-col sticky top-0 h-screen box-border max-stack:w-full max-stack:h-auto max-stack:static max-stack:flex-row max-stack:flex-wrap max-stack:items-center max-stack:gap-[8px_14px] max-stack:px-[18px] max-stack:py-4">
        <div className="max-stack:flex max-stack:items-baseline max-stack:gap-2">
          <div className="font-display font-bold text-[16.5px] text-cream px-2.5 pb-1.5 max-stack:p-0">
            TECH LAB ACADEMY
          </div>
          <div className="text-[11px] tracking-[.08em] uppercase text-amber px-2.5 pb-[26px] max-stack:p-0">
            Admin
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 max-stack:flex-row max-stack:flex-wrap max-stack:gap-1.5">
          {NAV.map((item) => {
            const isActive = active === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-[11px] rounded-lg text-ui ${
                  isActive
                    ? 'bg-amber text-ink font-bold'
                    : 'text-on-ink-2 font-medium hover:bg-cream/5'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex-1 max-stack:hidden" />
        <Link href="/" className="text-label text-on-ink-3 px-2.5 pb-3 block max-stack:hidden">
          ← Exit to site
        </Link>
        <div className="flex items-center gap-2.5 p-3 border-t border-[rgba(244,251,232,.1)] max-stack:hidden">
          <div className="w-[34px] h-[34px] rounded-full bg-amber text-ink text-meta font-bold flex items-center justify-center flex-none">
            {initials(user.fullName)}
          </div>
          <div className="min-w-0">
            <div className="text-meta font-bold text-cream truncate">{user.fullName}</div>
            <div className="text-micro text-on-ink-3">Admin</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-12 py-11 max-w-admin max-stack:px-5 max-stack:py-7">
        {children}
      </main>
    </div>
  )
}

/** Title, subtitle and an optional right-aligned action, as every manager uses. */
export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-start gap-5 mb-7 flex-wrap">
      <div>
        <div className="font-display font-bold text-admin-title text-ink mb-1">{title}</div>
        {subtitle ? <div className="text-body text-muted">{subtitle}</div> : null}
      </div>
      {action}
    </div>
  )
}
