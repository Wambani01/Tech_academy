import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EMAIL_RE } from '@/lib/validation'

/** Event registration. Open to anyone; RLS allows the insert. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    eventSlug?: string
    name?: string
    email?: string
  } | null

  if (!body?.eventSlug) return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })

  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  if (!name) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email doesn’t look right.' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Registration is not available yet.' }, { status: 503 })
  }

  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, status')
    .eq('slug', body.eventSlug)
    .maybeSingle()

  if (!event) return NextResponse.json({ error: 'That session no longer exists.' }, { status: 404 })
  if (event.status !== 'upcoming') {
    return NextResponse.json({ error: 'Registration for that session has closed.' }, { status: 409 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('registrations').insert({
    event_id: event.id,
    profile_id: user?.id ?? null,
    name,
    email,
  })

  if (error) return NextResponse.json({ error: 'Could not register you.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
