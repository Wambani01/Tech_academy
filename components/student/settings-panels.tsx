'use client'

import { useState } from 'react'
import { FilterPill } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { validateFullName, validatePassword } from '@/lib/validation'
import { initials } from '@/lib/format'

const TABS = ['Profile', 'Account', 'Notifications'] as const

const inputClass =
  'w-full box-border px-3.5 py-3 rounded-md border-[1.5px] border-line-strong text-ui text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

const labelClass = 'block text-label font-semibold text-ink mb-1.5'

export function SettingsPanels({
  profile,
}: {
  profile: { id: string; full_name: string; email: string; avatar_id: string | null }
}) {
  const [active, setActive] = useState<(typeof TABS)[number]>('Profile')

  return (
    <>
      <div className="flex gap-2.5 mb-7 flex-wrap">
        {TABS.map((tab) => (
          <FilterPill key={tab} active={tab === active} onClick={() => setActive(tab)}>
            {tab}
          </FilterPill>
        ))}
      </div>

      {active === 'Profile' ? <ProfilePanel profile={profile} /> : null}
      {active === 'Account' ? <AccountPanel /> : null}
      {active === 'Notifications' ? <NotificationsPanel /> : null}
    </>
  )
}

function ProfilePanel({
  profile,
}: {
  profile: { id: string; full_name: string; email: string }
}) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    const nameError = validateFullName(fullName)
    if (nameError) {
      setError(nameError)
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile.id)
    setBusy(false)
    if (updateError) setError('Could not save your changes. Try again.')
    else setSaved(true)
  }

  return (
    <form onSubmit={onSave} className="bg-white border border-line rounded-3xl p-8" noValidate>
      <div className="flex items-center gap-4 mb-7">
        <div className="w-16 h-16 rounded-full bg-amber text-ink text-[22px] font-bold flex items-center justify-center">
          {initials(fullName || profile.full_name)}
        </div>
        <span className="border-[1.5px] border-line-strong text-muted-2 px-4 py-[9px] rounded-md text-meta font-bold">
          Photo upload arrives with the media library
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 max-stack:grid-cols-1">
        <div>
          <label className={labelClass} htmlFor="full_name">
            Full name
          </label>
          <input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input id="email" value={profile.email} readOnly className={`${inputClass} opacity-70`} />
        </div>
      </div>

      {error ? <div className="text-pill font-semibold text-amber-deep mb-4">{error}</div> : null}
      {saved ? <div className="text-pill font-semibold text-forest mb-4">Saved.</div> : null}

      <button
        type="submit"
        disabled={busy}
        className="bg-ink text-cream px-6 py-[13px] rounded-md text-ui font-bold disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

function AccountPanel() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    setBusy(true)
    setError(null)
    setDone(false)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(updateError.message)
    else {
      setDone(true)
      setPassword('')
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-line rounded-3xl p-8" noValidate>
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className={labelClass} htmlFor="new_password">
            New password
          </label>
          <input
            id="new_password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>
      </div>

      {error ? <div className="text-pill font-semibold text-amber-deep mb-4">{error}</div> : null}
      {done ? <div className="text-pill font-semibold text-forest mb-4">Password updated.</div> : null}

      <button
        type="submit"
        disabled={busy}
        className="bg-ink text-cream px-6 py-[13px] rounded-md text-ui font-bold disabled:opacity-50"
      >
        {busy ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}

const NOTIFICATIONS = [
  ['Assignment reminders', 'Email when a due date is approaching', true],
  ['New masterclasses', 'Notify me about upcoming events', true],
  ['Product updates', 'Occasional news from the academy', false],
] as const

function NotificationsPanel() {
  const [state, setState] = useState<boolean[]>(NOTIFICATIONS.map((n) => n[2]))

  return (
    <div className="bg-white border border-line rounded-3xl px-8 py-3">
      {NOTIFICATIONS.map(([title, blurb], i) => (
        <div
          key={title}
          className={`flex justify-between items-center gap-5 py-[18px] ${
            i === NOTIFICATIONS.length - 1 ? '' : 'border-b border-line-soft'
          }`}
        >
          <div>
            <div className="text-body font-semibold text-ink">{title}</div>
            <div className="text-label text-muted">{blurb}</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state[i]}
            aria-label={title}
            onClick={() =>
              setState((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
            }
            className={`w-10 h-[22px] rounded-pill relative flex-none transition-colors ${
              state[i] ? 'bg-ink' : 'bg-ink/15'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full absolute top-[3px] transition-all ${
                state[i] ? 'bg-amber right-[3px]' : 'bg-white left-[3px]'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}
