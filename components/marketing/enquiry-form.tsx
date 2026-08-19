'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { validateEmail, validateFullName } from '@/lib/validation'

const inputClass =
  'w-full box-border px-3.5 py-[13px] rounded-md border-[1.5px] border-line-strong text-ui text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

type Errors = { name?: string; email?: string; form?: string }

/**
 * The enquiry form — v1's replacement for checkout.
 *
 * Keeps the contact fields, the order summary (rendered by the page) and the
 * validation; the payment method, discount code and pay button are gone until
 * payments land in v2.
 */
export function EnquiryForm({ courseSlug }: { courseSlug: string }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const nameError = validateFullName(fullName)
      ? 'Enter the name on the enrolment.'
      : undefined
    const emailError = validateEmail(email)
      ? 'Enter a valid email for your confirmation.'
      : undefined

    if (nameError || emailError) {
      setErrors({ name: nameError, email: emailError })
      return
    }

    setBusy(true)
    setErrors({})

    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ courseSlug, fullName, email, phone, message }),
    })

    setBusy(false)

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setErrors({ form: body.error ?? 'Could not send your enquiry. Try again.' })
      return
    }

    router.push('/enrol/received')
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="text-meta font-bold tracking-[.05em] uppercase text-muted mb-3.5">
        Contact
      </div>

      <div className="grid grid-cols-2 gap-3.5 mb-3.5 max-stack:grid-cols-1">
        <div>
          <label htmlFor="fullName" className="sr-only">
            Full name
          </label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className={inputClass}
          />
          {errors.name ? (
            <div className="text-pill font-semibold text-amber-deep mt-1.5">{errors.name}</div>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className={inputClass}
          />
          {errors.email ? (
            <div className="text-pill font-semibold text-amber-deep mt-1.5">{errors.email}</div>
          ) : null}
        </div>
      </div>

      <div className="mb-3.5">
        <label htmlFor="phone" className="sr-only">
          Phone
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div className="text-meta font-bold tracking-[.05em] uppercase text-muted mt-7 mb-3.5">
        Anything we should know?
      </div>
      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your background, which cohort you're aiming for, questions for admissions…"
        aria-label="Message for admissions"
        className={`${inputClass} resize-y mb-6`}
      />

      {errors.form ? (
        <div className="text-pill font-semibold text-amber-deep mb-4">{errors.form}</div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-ink text-cream py-4 rounded-md text-body font-bold disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Request a place'}
      </button>

      <div className="mt-4 text-label text-muted-2 leading-[1.55]">
        No payment is taken now. Admissions will confirm your cohort and the payment options by
        email.
      </div>
    </form>
  )
}
