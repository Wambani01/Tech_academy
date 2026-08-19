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
  ROLE_OPTIONS,
  TRACK_OPTIONS,
  adminInputClass,
} from '@/components/admin/form-kit'
import { deleteInstructor, saveInstructor } from '@/lib/admin-actions'
import { validateEmail } from '@/lib/validation'

export type InstructorFormValues = {
  id?: string
  fullName: string
  email: string
  track: string
  roleTitle: string
  bio: string
  photoId: string | null
}

const BIO_MAX = 220

const EMPTY: InstructorFormValues = {
  fullName: '',
  email: '',
  track: 'Marketing',
  roleTitle: 'Lead Instructor',
  bio: '',
  photoId: null,
}

export function InstructorForm({
  initial,
  library,
}: {
  initial?: InstructorFormValues
  library: Array<{ publicId: string; filename: string; url: string | null }>
}) {
  const router = useRouter()
  const [values, setValues] = useState<InstructorFormValues>(initial ?? EMPTY)
  const [errors, setErrors] = useState<{ email?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  const set = <K extends keyof InstructorFormValues>(k: K, v: InstructorFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  const photo = library.find((m) => m.publicId === values.photoId) ?? null

  async function onSave() {
    const emailError = validateEmail(values.email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }
    setBusy(true)
    setErrors({})
    const result = await saveInstructor(values)
    setBusy(false)
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    router.push('/admin/instructors')
    router.refresh()
  }

  return (
    <div className="max-w-form">
      {errors.form ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {errors.form}
        </div>
      ) : null}

      <FormPanel>
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-label font-semibold text-ink mb-2">Photo</div>
            <div className="flex gap-4 items-center flex-wrap">
              <div
                className="w-20 h-20 rounded-xl flex-none bg-cover bg-center bg-ink/8 border border-line"
                style={photo?.url ? { backgroundImage: `url('${photo.url}')` } : undefined}
              />
              <select
                value={values.photoId ?? ''}
                onChange={(e) => set('photoId', e.target.value || null)}
                aria-label="Instructor photo"
                className={`${adminInputClass} flex-1 min-w-[200px]`}
              >
                <option value="">No photo</option>
                {library.map((m) => (
                  <option key={m.publicId} value={m.publicId}>
                    {m.filename}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-micro text-muted-2 mt-2">
              Upload new headshots in the media library first.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-stack:grid-cols-1">
            <AdminField label="Full name" htmlFor="full_name">
              <input
                id="full_name"
                value={values.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Sarah Kamau"
                className={adminInputClass}
              />
            </AdminField>
            <AdminField label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="sarah.kamau@techlabacademy.co"
                className={adminInputClass}
              />
            </AdminField>
          </div>

          <div className="grid grid-cols-2 gap-4 max-stack:grid-cols-1">
            <AdminField label="Track" htmlFor="track">
              <AdminSelect
                id="track"
                value={values.track}
                onChange={(v) => set('track', v)}
                options={TRACK_OPTIONS}
              />
            </AdminField>
            <AdminField label="Role" htmlFor="role">
              <AdminSelect
                id="role"
                value={values.roleTitle}
                onChange={(v) => set('roleTitle', v)}
                options={ROLE_OPTIONS}
              />
            </AdminField>
          </div>

          <AdminField label="Bio" htmlFor="bio" counter={{ value: values.bio, max: BIO_MAX }}>
            <textarea
              id="bio"
              rows={3}
              value={values.bio}
              onChange={(e) => set('bio', e.target.value)}
              className={`${adminInputClass} resize-y`}
            />
          </AdminField>
        </div>
      </FormPanel>

      <FormActions>
        {initial?.id ? (
          <button
            type="button"
            onClick={() => setPendingDelete(true)}
            className="border-[1.5px] border-amber-deep/50 text-amber-deep px-5 py-3 rounded-md text-ui font-bold cursor-pointer mr-auto"
          >
            Remove instructor
          </button>
        ) : null}
        <Link
          href="/admin/instructors"
          className="border-[1.5px] border-line-strong text-ink px-5 py-3 rounded-md text-ui font-bold"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="bg-ink text-cream px-5 py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-50"
        >
          {busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Add instructor'}
        </button>
      </FormActions>

      <Modal
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        title={`Remove ${values.fullName}?`}
        actions={
          <ConfirmActions
            keepLabel="Keep instructor"
            confirmLabel="Remove instructor"
            busy={busy}
            onKeep={() => setPendingDelete(false)}
            onConfirm={async () => {
              if (!initial?.id) return
              setBusy(true)
              const result = await deleteInstructor(initial.id)
              setBusy(false)
              if (!result.ok) {
                setErrors({ form: result.error })
                setPendingDelete(false)
                return
              }
              router.push('/admin/instructors')
              router.refresh()
            }}
          />
        }
      >
        Their bio comes off the About page and any course they lead immediately. Courses they lead
        keep running with no instructor assigned.
      </Modal>
    </div>
  )
}
