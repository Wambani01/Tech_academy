'use client'

import { useState } from 'react'
import { validateEmail, validateFullName } from '@/lib/validation'

const inputClass =
  'w-full box-border px-3.5 py-[13px] rounded-md border-[1.5px] border-line-strong text-ui text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

export function EventRegisterForm({ eventSlug }: { eventSlug: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="bg-white border border-line rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-forest text-cream text-[22px] font-bold flex items-center justify-center mx-auto mb-5">
          ✓
        </div>
        <div className="font-display font-bold text-xl text-ink mb-2.5">You&rsquo;re registered</div>
        <div className="text-ui text-muted leading-[1.55]">
          We&rsquo;ve saved your place. The joining link goes out by email the day before.
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nameError = validateFullName(name) ?? undefined
    const emailError = validateEmail(email) ?? undefined
    if (nameError || emailError) {
      setErrors({ name: nameError, email: emailError })
      return
    }

    setBusy(true)
    setErrors({})
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventSlug, name, email }),
    })
    setBusy(false)

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setErrors({ form: body.error ?? 'Could not register you. Try again.' })
      return
    }
    setDone(true)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="bg-white border border-line rounded-3xl p-8">
      <div className="flex flex-col gap-4 mb-5">
        <div>
          <label htmlFor="name" className="block text-label font-semibold text-ink mb-1.5">
            Full name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={inputClass}
          />
          {errors.name ? (
            <div className="text-pill font-semibold text-amber-deep mt-1.5">{errors.name}</div>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="block text-label font-semibold text-ink mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
          {errors.email ? (
            <div className="text-pill font-semibold text-amber-deep mt-1.5">{errors.email}</div>
          ) : null}
        </div>
      </div>

      {errors.form ? (
        <div className="text-pill font-semibold text-amber-deep mb-4">{errors.form}</div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-ink text-cream py-3.5 rounded-md text-body font-bold disabled:opacity-50"
      >
        {busy ? 'Registering…' : 'Register — free'}
      </button>
    </form>
  )
}
