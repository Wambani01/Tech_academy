'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/env'
import { validateEmail } from '@/lib/validation'
import { AuthError, AuthLabel, AuthTitle, AuthSubtitle, authInputClass } from './auth-shell'

/**
 * Two states in one screen: the form, then the "Check your inbox" confirmation
 * naming the submitted address and its 30-minute expiry.
 */
export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Password reset is unavailable until the database is connected.')
      return
    }

    setBusy(true)
    setError(null)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })
    setBusy(false)
    // Always confirm, so the form never reveals whether an address is registered.
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-ink text-amber text-[22px] font-bold flex items-center justify-center mx-auto mb-[22px]">
          ✓
        </div>
        <div className="font-display font-bold text-2xl text-ink mb-2.5">Check your inbox</div>
        <div className="text-ui text-muted leading-[1.55] mb-7">
          We sent a reset link to <strong className="text-ink">{sentTo}</strong>. It expires in 30
          minutes.
        </div>
        <Link
          href="/sign-in"
          className="block bg-ink text-cream text-center py-3.5 rounded-md text-body font-bold mb-4"
        >
          Back to Sign In
        </Link>
        <button
          type="button"
          onClick={() => {
            setSentTo(null)
            setEmail('')
          }}
          className="text-meta text-muted cursor-pointer"
        >
          Didn&rsquo;t get it? <span className="text-ink font-bold">Use a different email</span>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <AuthTitle>Reset your password</AuthTitle>
      <AuthSubtitle>
        Enter the email you signed up with and we&rsquo;ll send you a reset link.
      </AuthSubtitle>

      <div className="mb-[22px]">
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
        <AuthError>{error}</AuthError>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-ink text-cream text-center py-3.5 rounded-md text-body font-bold mb-[22px] disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Send Reset Link'}
      </button>
      <div className="text-center text-[13.5px] text-muted">
        <Link href="/sign-in" className="text-ink font-bold">
          Back to sign in
        </Link>
      </div>
    </form>
  )
}
