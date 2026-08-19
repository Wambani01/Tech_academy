import type { Metadata } from 'next'

/**
 * The console reads the session on every screen and must never be prerendered.
 * The role guard itself lives in the middleware and in `requireAdmin()`.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Console', template: '%s · Console' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
