'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/env'
import { validateEmail } from '@/lib/validation'
import { AuthError, AuthLabel, AuthTitle, AuthSubtitle, authInputClass } from './auth-shell'

type Errors = { email?: string; password?: string; code?: string; form?: string }

export function AdminSignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/admin'
  const denied = params.get('denied') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<Errors>({})
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
      setErrors({ form: 'The console is unavailable until the database is connected.' })
      return
    }

    setBusy(true)
    setErrors({})
    const supabase = createClient()

    const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !signIn.user) {
      setBusy(false)
      setErrors({ form: 'That email and password don’t match a staff account.' })
      return
    }

    // The console requires a second factor whenever the account has one enrolled.
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totp = factors?.totp?.[0]
    if (totp) {
      if (!code.trim()) {
        setBusy(false)
        setErrors({ code: 'Enter the 6-digit code from your authenticator.' })
        return
      }
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: totp.id })
      const verify = challenge
        ? await supabase.auth.mfa.verify({
            factorId: totp.id,
            challengeId: challenge.id,
            code: code.trim(),
          })
        : { error: new Error('challenge failed') }

      if (verify.error) {
        setBusy(false)
        setErrors({ code: 'That code isn’t valid. Try the current one.' })
        return
      }
    }

    // Role is enforced by the middleware and the admin layout; check here too so
    // a non-staff account gets a message instead of a redirect loop.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signIn.user.id)
      .single()

    setBusy(false)

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setErrors({ form: 'That account doesn’t have console access.' })
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <>
      <AuthTitle>Admin sign in</AuthTitle>
      <AuthSubtitle>Restricted to staff accounts.</AuthSubtitle>

      {denied ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3 py-2.5 mb-5">
          That account doesn&rsquo;t have console access.
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <AuthLabel htmlFor="email">Work email</AuthLabel>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@techlabacademy.co"
              className={authInputClass}
            />
            <AuthError>{errors.email}</AuthError>
          </div>
          <div>
            <AuthLabel htmlFor="password">Password</AuthLabel>
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
          <div>
            <AuthLabel htmlFor="code">2FA code</AuthLabel>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className={authInputClass}
            />
            <AuthError>{errors.code}</AuthError>
          </div>
        </div>

        <AuthError>{errors.form}</AuthError>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-cream text-center py-3.5 rounded-md text-body font-bold mb-[18px] mt-2 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign In to Console'}
        </button>
      </form>

      <div className="text-center text-meta text-muted">
        Not staff?{' '}
        <Link href="/sign-in" className="text-ink font-bold">
          Go to student sign in
        </Link>
      </div>
    </>
  )
}
