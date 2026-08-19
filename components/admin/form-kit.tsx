'use client'

import type { ReactNode } from 'react'

/** Shared field controls for the single-column admin forms (820px). */

export const adminInputClass =
  'w-full box-border px-3.5 py-3 rounded-md border-[1.5px] border-line-strong text-ui text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

export function AdminField({
  label,
  htmlFor,
  counter,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  counter?: { value: string; max: number }
  error?: string
  hint?: string
  children: ReactNode
}) {
  const over = counter ? counter.value.length > counter.max : false
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5 gap-3">
        <label htmlFor={htmlFor} className="text-label font-semibold text-ink">
          {label}
        </label>
        {counter ? (
          <span
            className={`text-micro tabular-nums ${
              over ? 'text-amber-deep font-semibold' : 'text-muted-2'
            }`}
          >
            {counter.value.length} / {counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {hint && !error ? <div className="text-micro text-muted-2 mt-1.5">{hint}</div> : null}
      {error ? <div className="text-pill font-semibold text-amber-deep mt-1.5">{error}</div> : null}
    </div>
  )
}

export function AdminSelect({
  id,
  value,
  onChange,
  options,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={adminInputClass}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export function FormPanel({ children }: { children: ReactNode }) {
  return <div className="bg-white border border-line rounded-3xl p-8 max-stack:p-6">{children}</div>
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-2.5 justify-end mt-7 flex-wrap">{children}</div>
}

export const TRACK_OPTIONS = ['Marketing', 'Design', 'Development', 'Automation'] as const
export const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const
export const FORMAT_OPTIONS = ['Online, Live', 'Hybrid', 'In person'] as const
export const ROLE_OPTIONS = ['Lead Instructor', 'Guest Instructor'] as const
