'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './index'

/**
 * The confirmation modal from the prototypes.
 *
 * Destructive actions are always a modal, never immediate, and the body copy
 * states the real consequence ("312 enrolled students will lose access
 * immediately"). That is the point of the pattern — keep it.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  labelledBy = 'modal-title',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions: ReactNode
  labelledBy?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.activeElement as HTMLElement | null
    cardRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-ink/50 grid place-items-center p-6 z-50"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="bg-white rounded-4xl p-8 w-full max-w-[440px] outline-none"
      >
        <div id={labelledBy} className="font-display font-bold text-xl text-ink mb-2.5">
          {title}
        </div>
        <div className="text-ui text-muted leading-[1.55] mb-[26px]">{children}</div>
        <div className="flex gap-2.5 justify-end flex-wrap">{actions}</div>
      </div>
    </div>
  )
}

/** The two-button footer every destructive modal uses. */
export function ConfirmActions({
  keepLabel,
  confirmLabel,
  onKeep,
  onConfirm,
  busy,
}: {
  keepLabel: string
  confirmLabel: string
  onKeep: () => void
  onConfirm: () => void
  busy?: boolean
}) {
  return (
    <>
      <Button variant="secondary" onClick={onKeep} disabled={busy}>
        {keepLabel}
      </Button>
      <Button variant="destructive" onClick={onConfirm} disabled={busy}>
        {busy ? 'Working…' : confirmLabel}
      </Button>
    </>
  )
}
