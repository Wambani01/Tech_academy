import Link from 'next/link'

const NAV = [
  { href: '/courses', label: 'Courses' },
  { href: '/business', label: 'For Business' },
  { href: '/campus', label: 'Campus' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
] as const

export type NavKey = (typeof NAV)[number]['href']

/**
 * The public header. Sits on the ink hero, so it carries no background of its
 * own — each page wraps it in the dark block.
 *
 * The link group has a real `gap` and wraps below the logo under 860px, so it
 * never collides with the logo.
 */
export function SiteHeader({
  active,
  cta = { href: '/courses', label: 'Start Learning' },
}: {
  active?: NavKey
  cta?: { href: string; label: string }
}) {
  return (
    <div className="container-site flex items-center justify-between gap-[18px_28px] flex-wrap py-[22px] max-stack:py-[18px]">
      <Link
        href="/"
        className="font-display font-bold text-[19px] text-cream tracking-[-.01em]"
      >
        TECH LAB ACADEMY
      </Link>
      <div className="flex items-center gap-[34px] flex-wrap max-stack:gap-4">
        <nav className="flex gap-7 text-ui font-medium max-stack:gap-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={active === item.href ? 'text-amber' : 'text-on-ink-2 hover:text-cream'}
              aria-current={active === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3.5">
          <Link href="/sign-in" className="text-ui text-on-ink-2 font-medium hover:text-cream">
            Sign In
          </Link>
          <Link
            href={cta.href}
            className="bg-amber text-ink px-[22px] py-[11px] rounded-xs text-ui font-bold"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </div>
  )
}
