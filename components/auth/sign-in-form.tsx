'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { validateEmail } from '@/lib/validation'
import { AuthError, AuthLabel, AuthTitle, AuthSubtitle, OrRule, authInputClass } from './auth-shell'
import { isSupabaseConfigured } from '@/lib/env'

export function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  // Set by /api/auth/sign-up when the account was created but the session was
  // not, and by /auth/callback when an email or OAuth link fails to exchange.
  const notice = params.get('created')
    ? 'Your account is ready. Sign in to continue.'
    : params.get('error') === 'callback'
      ? 'That sign-in link has expired or was already used. Try again.'
      : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const emailError = validateEmail(email)
    const passwordError = password ? undefined : 'Enter your password.'
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError })
      return
    }

    if (!isSupabaseConfigured()) {
      setErrors({ form: 'Sign in is unavailable until the database is connected.' })
      return
    }

    setBusy(true)
    setErrors({})
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) {
      setErrors({ form: 'That email and password don’t match an account.' })
      return
    }
    router.push(next)
    router.refresh()
  }

  async function onGoogle() {
    if (!isSupabaseConfigured()) {
      setErrors({ form: 'Sign in is unavailable until the database is connected.' })
      return
    }
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <>
      <AuthTitle>Welcome back</AuthTitle>
      <AuthSubtitle>Sign in to continue your learning.</AuthSubtitle>

      {notice ? (
        <div className="text-label text-muted bg-[rgba(15,32,25,.05)] rounded-md px-3.5 py-3 mb-5 leading-[1.5]">
          {notice}
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-4 mb-5">
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
            <div className="flex justify-between mb-1.5">
              <label htmlFor="password" className="text-label font-semibold text-ink">
                Password
              </label>
              <Link href="/reset-password" className="text-label text-ink font-semibold">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={authInputClass}
            />
            <AuthError>{errors.password}</AuthError>
          </div>
        </div>

        <AuthError>{errors.form}</AuthError>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-cream text-center py-3.5 rounded-md text-body font-bold mb-[22px] mt-2 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign In'}
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

      <div className="text-center text-[13.5px] text-muted mb-2.5">
        New here?{' '}
        <Link href="/sign-up" className="text-ink font-bold">
          Create an account
        </Link>
      </div>
      <div className="text-center text-label text-on-ink-3">
        Staff?{' '}
        <Link href="/admin/sign-in" className="text-muted font-bold">
          Sign in to the console
        </Link>
      </div>
    </>
  )
}
