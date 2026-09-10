import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { validateEmail, validateFullName, validatePassword } from '@/lib/validation'

/**
 * Server-side sign-up.
 *
 * The browser used to call `supabase.auth.signUp()` directly, which leaves the
 * account's usability at the mercy of the project's email-confirmation setting:
 * with confirmation on, the form redirected to /dashboard before a session
 * existed, so a correct sign-up looked like a broken one.
 *
 * Creating the user here with the service role and `email_confirm: true` makes
 * the outcome the same either way — the account is live the moment it is made,
 * and the session cookies are set before we reply.
 *
 * The trade-off is deliberate and worth stating: nothing here proves the person
 * owns the address they typed. That is acceptable while the product treats email
 * as a login handle rather than a verified channel. If email ever carries
 * something sensitive — password resets already do — this route needs a real
 * confirmation step in front of it.
 */

export const runtime = 'nodejs'

// Throttle per IP. In-process only, so it resets on redeploy and does not span
// serverless instances: it blunts casual scripted abuse and nothing more. A
// shared store is the fix when this endpoint matters enough to warrant one.
const WINDOW_MS = 60_000
// Locally every request shares one IP, so this is effectively a global cap
// during development — keep it loose enough not to interrupt manual testing.
const MAX_PER_WINDOW = 10
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) hits.clear() // crude ceiling; this map is not a cache
  return recent.length > MAX_PER_WINDOW
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string
    email?: string
    password?: string
  } | null

  if (!body) return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })

  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''

  // Same messages as the client-side checks, so a bypassed form reads identically.
  const fieldError =
    validateFullName(name) ?? validateEmail(email) ?? validatePassword(password)
  if (fieldError) return NextResponse.json({ error: fieldError }, { status: 400 })

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: 'Sign up is unavailable until the database is connected.' },
      { status: 503 }
    )
  }

  const admin = createServiceClient()

  // `handle_new_user` reads full_name out of raw_user_meta_data to build the
  // profile row, so the metadata key has to match the trigger.
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (createError) {
    const alreadyExists =
      createError.status === 422 || /already (been )?registered|already exists/i.test(createError.message)

    if (alreadyExists) {
      return NextResponse.json(
        { error: 'An account with that email already exists.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 })
  }

  // Establish the session on the cookie-aware client so the redirect that
  // follows lands on a page that already knows who the user is.
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    // The account exists; only the session failed. Send them to sign-in rather
    // than pretending nothing happened.
    return NextResponse.json(
      { error: 'Account created, but sign-in failed. Please sign in.', signIn: true },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
