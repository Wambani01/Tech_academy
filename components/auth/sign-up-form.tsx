'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/env'
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validateTerms,
} from '@/lib/validation'
import { AuthError, AuthLabel, AuthTitle, AuthSubtitle, OrRule, authInputClass } from './auth-shell'

type Errors = {
  name?: string
  email?: string
  password?: string
  terms?: string
  form?: string
}

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation runs on submit, not on blur.
    const next: Errors = {
      name: validateFullName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      terms: validateTerms(terms) ?? undefined,
    }
    if (next.name || next.email || next.password || next.terms) {
      setErrors(next)
      return
    }

    if (!isSupabaseConfigured()) {
      setErrors({ form: 'Sign up is unavailable until the database is connected.' })
      return
    }

    setBusy(true)
    setErrors({})

    // Sign-up runs server-side: /api/auth/sign-up creates the account already
    // confirmed and sets the session cookies, so the account is usable whatever
    // the project's email-confirmation setting happens to be.
    let payload: { ok?: boolean; error?: string; signIn?: boolean } = {}
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      payload = await res.json().catch(() => ({}))

      if (!res.ok) {
        setBusy(false)
        if (payload.signIn) {
          router.push('/sign-in?created=1')
          return
        }
        setErrors({ form: payload.error ?? 'Could not create your account.' })
        return
      }
    } catch {
      setBusy(false)
      setErrors({ form: 'Could not reach the server. Check your connection.' })
      return
    }

    setBusy(false)
    router.push('/dashboard')
    router.refresh()
  }

  async function onGoogle() {
    if (!isSupabaseConfigured()) {
      setErrors({ form: 'Sign up is unavailable until the database is connected.' })
      return
    }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <>
      <AuthTitle>Create your account</AuthTitle>
      <AuthSubtitle>One account for every track, cohort and event.</AuthSubtitle>

      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-4 mb-5">
          <div>
            <AuthLabel htmlFor="name">Full name</AuthLabel>
            <input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amina Wanjiru"
              className={authInputClass}
            />
            <AuthError>{errors.name}</AuthError>
          </div>
          <div>
            <AuthLabel htmlFor="email">Email</AuthLabel>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={authInputClass}
            />
            <AuthError>{errors.email}</AuthError>
          </div>
          <div>
            <AuthLabel htmlFor="password">Password</AuthLabel>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={authInputClass}
            />
            <AuthError>{errors.password}</AuthError>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTerms((v) => !v)}
          aria-pressed={terms}
          className="flex gap-2.5 items-start mb-[22px] cursor-pointer text-left w-full"
        >
          <span
            aria-hidden
            className={`w-[18px] h-[18px] flex-none rounded-xs text-cream text-pill font-bold flex items-center justify-center mt-px border-[1.5px] ${
              terms ? 'border-ink bg-ink' : 'border-[rgba(15,32,25,.3)] bg-white'
            }`}
          >
            {terms ? '✓' : ''}
          </span>
          <span className="text-label text-muted leading-[1.5]">
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </button>
        {errors.terms ? (
          <div className="text-pill font-semibold text-amber-deep -mt-3.5 mb-[18px]">
            {errors.terms}
          </div>
        ) : null}

        <AuthError>{errors.form}</AuthError>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-cream text-center py-3.5 rounded-md text-body font-bold mb-[22px] mt-2 disabled:opacity-50"
        >
          {busy ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <OrRule />

      <button
        type="button"
        onClick={onGoogle}
        className="w-full border-[1.5px] border-ink text-ink text-center py-[13px] rounded-md text-ui font-bold mb-6"
      >
        Continue with Google
      </button>

      <div className="text-center text-[13.5px] text-muted">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-ink font-bold">
          Sign in
        </Link>
      </div>
    </>
  )
}
