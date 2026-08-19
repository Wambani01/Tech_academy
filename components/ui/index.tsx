/**
 * Shared primitives.
 *
 * Every value here comes from the "Component recipes" block in
 * `tokens/tailwind-theme.css` — that file is the contract.
 */
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cx } from '@/lib/format'

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

export type ButtonVariant =
  | 'primary'
  | 'primary-lg'
  | 'secondary'
  | 'on-ink'
  | 'destructive'
  | 'danger-ghost'

export const buttonClass: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center gap-2 bg-ink text-cream px-[22px] py-[13px] rounded-md text-ui font-bold disabled:opacity-40 disabled:cursor-not-allowed',
  'primary-lg':
    'inline-flex items-center justify-center gap-2 bg-amber text-ink px-[30px] py-4 rounded-sm text-[15px] font-bold',
  secondary:
    'inline-flex items-center justify-center gap-2 border-[1.5px] border-line-strong text-ink px-[22px] py-[13px] rounded-md text-ui font-bold disabled:opacity-40 disabled:cursor-not-allowed',
  'on-ink':
    'inline-flex items-center justify-center gap-2 border-[1.5px] border-[rgba(244,251,232,.3)] text-cream px-[30px] py-4 rounded-sm text-[15px] font-bold',
  destructive:
    'inline-flex items-center justify-center gap-2 bg-amber-deep text-white px-5 py-3 rounded-md text-ui font-bold',
  'danger-ghost':
    'inline-flex items-center justify-center gap-2 border-[1.5px] border-amber-deep/50 text-amber-deep px-5 py-3 rounded-md text-ui font-bold',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant }) {
  return <button className={cx(buttonClass[variant], className)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  className,
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { variant?: ButtonVariant; href: string }) {
  return <Link href={href} className={cx(buttonClass[variant], className)} {...props} />
}

/* ------------------------------------------------------------------ */
/* Fields                                                             */
/* ------------------------------------------------------------------ */

export const inputClass =
  'w-full px-[14px] py-[13px] rounded-md border-[1.5px] border-line-strong text-[14.5px] text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-label font-bold text-ink mb-2">
      {children}
    </label>
  )
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <div className="text-pill font-semibold text-amber-deep mt-1.5">{children}</div>
}

/** `n / max`, right-aligned above long fields. */
export function CharCounter({ value, max }: { value: string; max: number }) {
  return (
    <span className="text-micro text-muted-2 tabular-nums">
      {value.length} / {max}
    </span>
  )
}

export function Field({
  label,
  error,
  hint,
  counter,
  htmlFor,
  children,
}: {
  label: string
  error?: string
  hint?: string
  counter?: ReactNode
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        {counter}
      </div>
      {children}
      {hint && !error ? <div className="text-micro text-muted-2 mt-1.5">{hint}</div> : null}
      <FieldError>{error}</FieldError>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pills                                                              */
/* ------------------------------------------------------------------ */

export function FilterPill({
  active,
  className,
  ...props
}: ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        'px-[18px] py-[9px] rounded-pill text-[13.5px] font-bold border-[1.5px] whitespace-nowrap transition-colors',
        active
          ? 'bg-ink text-cream border-ink'
          : 'bg-transparent text-ink border-line-strong hover:border-ink/40',
        className
      )}
      {...props}
    />
  )
}

export type StatusTone = 'live' | 'draft' | 'pending'

const statusToneClass: Record<StatusTone, string> = {
  live: 'text-forest bg-forest/12',
  draft: 'text-muted bg-ink/8',
  pending: 'text-amber-deep bg-amber/15',
}

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-block text-pill font-bold px-[11px] py-[5px] rounded-pill whitespace-nowrap',
        statusToneClass[tone]
      )}
    >
      {children}
    </span>
  )
}

/** Maps the domain statuses onto the three visual tones. */
export function toneFor(status: string): StatusTone {
  switch (status) {
    case 'published':
    case 'live':
    case 'active':
    case 'graded':
    case 'completed':
    case 'enrolled':
      return 'live'
    case 'pending':
    case 'due':
    case 'submitted':
    case 'upcoming':
    case 'new':
      return 'pending'
    default:
      return 'draft'
  }
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                           */
/* ------------------------------------------------------------------ */

export function Panel({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div className={cx('bg-card border border-line rounded-3xl', className)} {...props}>
      {children}
    </div>
  )
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return <div className="font-display font-bold text-panel text-ink">{children}</div>
}

/** Centred empty state used across the admin tables and student lists. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="px-8 py-16 text-center">
      <div className="font-display font-bold text-[19px] text-ink mb-2.5">{title}</div>
      <div className="text-ui text-muted leading-[1.55] max-w-[420px] mx-auto">{body}</div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
