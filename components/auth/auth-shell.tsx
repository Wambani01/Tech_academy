import Link from 'next/link'

/** The dark, centred frame every auth screen sits in. */
export function AuthShell({
  eyebrow,
  children,
}: {
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-ink min-h-screen flex flex-col items-center px-6 py-14">
      <Link
        href="/"
        className="font-display font-bold text-[19px] text-cream tracking-[-.01em]"
        style={{ marginBottom: eyebrow ? 8 : 56 }}
      >
        TECH LAB ACADEMY
      </Link>
      {eyebrow ? (
        <div className="text-micro tracking-[.08em] uppercase text-amber mb-12">{eyebrow}</div>
      ) : null}

      <div className="w-full max-w-[400px] bg-cream rounded-4xl px-9 py-10 box-border">
        {children}
      </div>

      <div className="mt-8 text-label text-on-ink-4">
        © {new Date().getFullYear()} Tech Lab Academy. All rights reserved.
      </div>
    </div>
  )
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-display font-bold text-[26px] text-ink mb-2">{children}</div>
}

export function AuthSubtitle({ children }: { children: React.ReactNode }) {
  return <div className="text-ui text-muted leading-[1.55] mb-8">{children}</div>
}

export const authInputClass =
  'w-full box-border px-3.5 py-[13px] rounded-md border-[1.5px] border-line-strong text-[14.5px] text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

export function AuthLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-label font-semibold text-ink mb-1.5">
      {children}
    </label>
  )
}

export function AuthError({ children }: { children?: string | false | null }) {
  if (!children) return null
  return <div className="text-pill font-semibold text-amber-deep mt-1.5">{children}</div>
}

/** The "or" rule between the password form and the Google button. */
export function OrRule() {
  return (
    <div className="flex items-center gap-3 mb-[22px]">
      <div className="flex-1 h-px bg-[rgba(15,32,25,.15)]" />
      <span className="text-pill text-muted">or</span>
      <div className="flex-1 h-px bg-[rgba(15,32,25,.15)]" />
    </div>
  )
}
