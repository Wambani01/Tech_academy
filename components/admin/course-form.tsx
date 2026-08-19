'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import {
  AdminField,
  AdminSelect,
  FormActions,
  FormPanel,
  LEVEL_OPTIONS,
  TRACK_OPTIONS,
  adminInputClass,
} from '@/components/admin/form-kit'
import { deleteCourse, saveCourse } from '@/lib/admin-actions'
import type { CourseStatus } from '@/types/database'

export type CourseFormValues = {
  id?: string
  title: string
  track: string
  level: string
  blurb: string
  description: string
  duration: string
  priceKes: number
  leadInstructorId: string | null
  status: CourseStatus
}

const BLURB_MAX = 140

const EMPTY: CourseFormValues = {
  title: '',
  track: 'Marketing',
  level: 'Beginner',
  blurb: '',
  description: '',
  duration: '6 weeks · Cohort',
  priceKes: 15000,
  leadInstructorId: null,
  status: 'draft',
}

/**
 * Add Course is a three-step wizard (details → curriculum → pricing & publish)
 * with progress dots; Edit Course is the same fields as one form.
 */
export function CourseForm({
  initial,
  instructors,
  wizard = false,
  enrolled = 0,
}: {
  initial?: CourseFormValues
  instructors: Array<{ id: string; fullName: string }>
  wizard?: boolean
  enrolled?: number
}) {
  const router = useRouter()
  const [values, setValues] = useState<CourseFormValues>(initial ?? EMPTY)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  const set = <K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const STEPS = ['Details', 'Curriculum', 'Pricing & publish'] as const

  async function onSubmit(status?: CourseStatus) {
    setBusy(true)
    setError(null)
    const result = await saveCourse({ ...values, status: status ?? values.status })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (wizard && result.id) router.push(`/admin/courses/${result.id}/content`)
    else router.push('/admin/courses')
    router.refresh()
  }

  const detailsValid = values.title.trim() && values.blurb.trim()

  return (
    <div className="max-w-form">
      {wizard ? (
        <div className="flex items-center gap-3 mb-7 flex-wrap">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full text-pill font-bold flex items-center justify-center ${
                  i === step
                    ? 'bg-amber text-ink'
                    : i < step
                      ? 'bg-ink text-cream'
                      : 'bg-ink/10 text-muted'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </span>
              <span
                className={`text-meta ${i === step ? 'font-bold text-ink' : 'text-muted'}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? <span className="w-6 h-px bg-line-strong" /> : null}
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      {!wizard || step === 0 ? (
        <FormPanel>
          <div className="flex flex-col gap-5">
            <AdminField label="Course title" htmlFor="title">
              <input
                id="title"
                value={values.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="AI-Powered Content & Campaigns"
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
              <AdminField label="Level" htmlFor="level">
                <AdminSelect
                  id="level"
                  value={values.level}
                  onChange={(v) => set('level', v)}
                  options={LEVEL_OPTIONS}
                />
              </AdminField>
            </div>

            <AdminField
              label="Short blurb"
              htmlFor="blurb"
              counter={{ value: values.blurb, max: BLURB_MAX }}
              hint="Shown on the catalogue card."
            >
              <textarea
                id="blurb"
                rows={2}
                value={values.blurb}
                onChange={(e) => set('blurb', e.target.value)}
                className={`${adminInputClass} resize-y`}
              />
            </AdminField>

            <AdminField label="Full description" htmlFor="description">
              <textarea
                id="description"
                rows={4}
                value={values.description}
                onChange={(e) => set('description', e.target.value)}
                className={`${adminInputClass} resize-y`}
              />
            </AdminField>

            <AdminField label="Lead instructor" htmlFor="instructor">
              <select
                id="instructor"
                value={values.leadInstructorId ?? ''}
                onChange={(e) => set('leadInstructorId', e.target.value || null)}
                className={adminInputClass}
              >
                <option value="">Not assigned</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.fullName}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
        </FormPanel>
      ) : null}

      {wizard && step === 1 ? (
        <FormPanel>
          <div className="font-display font-bold text-lg text-ink mb-2">Curriculum</div>
          <div className="text-ui text-muted leading-[1.6]">
            Save the course first — the module and lesson builder opens straight after, so you can
            add the curriculum against a real course record.
          </div>
        </FormPanel>
      ) : null}

      {!wizard || step === 2 ? (
        <div className={wizard ? '' : 'mt-5'}>
          <FormPanel>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 max-stack:grid-cols-1">
                <AdminField label="Duration" htmlFor="duration" hint="e.g. 6 weeks · Cohort">
                  <input
                    id="duration"
                    value={values.duration}
                    onChange={(e) => set('duration', e.target.value)}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Price (KES)" htmlFor="price">
                  <input
                    id="price"
                    type="number"
                    min={0}
                    step={500}
                    value={values.priceKes}
                    onChange={(e) => set('priceKes', Number(e.target.value))}
                    className={adminInputClass}
                  />
                </AdminField>
              </div>

              <AdminField
                label="Status"
                htmlFor="status"
                hint="Only published courses appear in the public catalogue."
              >
                <select
                  id="status"
                  value={values.status}
                  onChange={(e) => set('status', e.target.value as CourseStatus)}
                  className={adminInputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </AdminField>
            </div>
          </FormPanel>
        </div>
      ) : null}

      <FormActions>
        {initial?.id ? (
          <button
            type="button"
            onClick={() => setPendingDelete(true)}
            className="border-[1.5px] border-amber-deep/50 text-amber-deep px-5 py-3 rounded-md text-ui font-bold cursor-pointer mr-auto"
          >
            Delete course
          </button>
        ) : null}

        {wizard && step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="border-[1.5px] border-line-strong text-ink px-5 py-3 rounded-md text-ui font-bold cursor-pointer"
          >
            Back
          </button>
        ) : (
          <Link
            href="/admin/courses"
            className="border-[1.5px] border-line-strong text-ink px-5 py-3 rounded-md text-ui font-bold"
          >
            Cancel
          </Link>
        )}

        {wizard && step < 2 ? (
          <button
            type="button"
            disabled={step === 0 && !detailsValid}
            onClick={() => setStep((s) => s + 1)}
            className="bg-ink text-cream px-5 py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || !detailsValid}
            onClick={() => onSubmit()}
            className="bg-ink text-cream px-5 py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-40"
          >
            {busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create course'}
          </button>
        )}
      </FormActions>

      <Modal
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        title="Delete this course?"
        actions={
          <ConfirmActions
            keepLabel="Keep course"
            confirmLabel="Delete course"
            busy={busy}
            onKeep={() => setPendingDelete(false)}
            onConfirm={async () => {
              if (!initial?.id) return
              setBusy(true)
              const result = await deleteCourse(initial.id)
              setBusy(false)
              if (!result.ok) {
                setError(result.error)
                setPendingDelete(false)
                return
              }
              router.push('/admin/courses')
              router.refresh()
            }}
          />
        }
      >
        <strong className="text-ink">{values.title}</strong>
        <br />
        <br />
        {enrolled > 0
          ? `${enrolled} enrolled student${enrolled === 1 ? '' : 's'} will lose access immediately.`
          : 'This course has no enrolments, so nothing else is affected.'}
      </Modal>
    </div>
  )
}
