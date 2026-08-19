'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import {
  AdminField,
  AdminSelect,
  FORMAT_OPTIONS,
  FormActions,
  FormPanel,
  TRACK_OPTIONS,
  adminInputClass,
} from '@/components/admin/form-kit'
import { cancelEvent, saveEvent } from '@/lib/admin-actions'

export type EventFormValues = {
  id?: string
  title: string
  track: string
  format: string
  startsAt: string
  capacity: number | null
  description: string
}

const EMPTY: EventFormValues = {
  title: '',
  track: 'Marketing',
  format: 'Online, Live',
  startsAt: '',
  capacity: 200,
  description: '',
}

export function EventForm({
  initial,
  registrants = 0,
  cancelled = false,
}: {
  initial?: EventFormValues
  registrants?: number
  cancelled?: boolean
}) {
  const router = useRouter()
  const [values, setValues] = useState<EventFormValues>(initial ?? EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pendingCancel, setPendingCancel] = useState(false)

  const set = <K extends keyof EventFormValues>(k: K, v: EventFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  async function onSave() {
    setBusy(true)
    setError(null)
    const result = await saveEvent(values)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push('/admin/events')
    router.refresh()
  }

  return (
    <div className="max-w-form">
      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      <FormPanel>
        <div className="flex flex-col gap-5">
          <AdminField label="Title" htmlFor="title">
            <input
              id="title"
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="AI Campaign Automation in 90 Minutes"
              className={adminInputClass}
            />
          </AdminField>

          <div className="grid grid-cols-2 gap-4 max-stack:grid-cols-1">
            <AdminField label="Track" htmlFor="track">
              <AdminSelect
                id="track"
                value={values.track}
                onChange={(v) => set('track', v)}
                options={TRACK_OPTIONS}
              />
            </AdminField>
            <AdminField label="Format" htmlFor="format">
              <AdminSelect
                id="format"
                value={values.format}
                onChange={(v) => set('format', v)}
                options={FORMAT_OPTIONS}
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-2 gap-4 max-stack:grid-cols-1">
            <AdminField label="Date and time" htmlFor="starts_at" hint="Local time (EAT).">
              <input
                id="starts_at"
                type="datetime-local"
                value={values.startsAt}
                onChange={(e) => set('startsAt', e.target.value)}
                className={adminInputClass}
              />
            </AdminField>
            <AdminField label="Capacity" htmlFor="capacity" hint="Leave blank for unlimited.">
              <input
                id="capacity"
                type="number"
                min={0}
                value={values.capacity ?? ''}
                onChange={(e) => set('capacity', e.target.value ? Number(e.target.value) : null)}
                className={adminInputClass}
              />
            </AdminField>
          </div>

          <AdminField label="Description" htmlFor="description">
            <textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              className={`${adminInputClass} resize-y`}
            />
          </AdminField>
        </div>
      </FormPanel>

      <FormActions>
        {initial?.id && !cancelled ? (
          <button
            type="button"
            onClick={() => setPendingCancel(true)}
            className="border-[1.5px] border-amber-deep/50 text-amber-deep px-5 py-3 rounded-md text-ui font-bold cursor-pointer mr-auto"
          >
            Cancel event
          </button>
        ) : null}
        <Link
          href="/admin/events"
          className="border-[1.5px] border-line-strong text-ink px-5 py-3 rounded-md text-ui font-bold"
        >
          Back
        </Link>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="bg-ink text-cream px-5 py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-50"
        >
          {busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create event'}
        </button>
      </FormActions>

      <Modal
        open={pendingCancel}
        onClose={() => setPendingCancel(false)}
        title="Cancel this masterclass?"
        actions={
          <ConfirmActions
            keepLabel="Keep event"
            confirmLabel="Cancel event"
            busy={busy}
            onKeep={() => setPendingCancel(false)}
            onConfirm={async () => {
              if (!initial?.id) return
              setBusy(true)
              const result = await cancelEvent(initial.id)
              setBusy(false)
              if (!result.ok) {
                setError(result.error)
                setPendingCancel(false)
                return
              }
              router.push('/admin/events')
              router.refresh()
            }}
          />
        }
      >
        <strong className="text-ink">{values.title}</strong>
        <br />
        <br />
        {registrants > 0
          ? `All ${registrants} registrant${registrants === 1 ? '' : 's'} will be emailed automatically.`
          : 'Nobody has registered yet, so no one will be notified.'}
      </Modal>
    </div>
  )
}
