import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EMAIL_RE } from '@/lib/validation'

/**
 * Enquiry intake — the v1 replacement for checkout.
 *
 * Anyone may submit (RLS allows the insert); only staff may read. The insert
 * runs through the anon client so RLS still applies; the notification email is
 * best-effort and never blocks the response.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    courseSlug?: string
    fullName?: string
    email?: string
    phone?: string
    message?: string
  } | null

  if (!body) return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })

  const fullName = (body.fullName ?? '').trim()
  const email = (body.email ?? '').trim()

  if (!fullName) return NextResponse.json({ error: 'Enter the name on the enrolment.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email for your confirmation.' }, { status: 400 })
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({ error: 'Enquiries are not available yet.' }, { status: 503 })
  }

  const supabase = await createClient()

  let courseId: string | null = null
  let courseTitle: string | null = null
  if (body.courseSlug) {
    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('slug', body.courseSlug)
      .maybeSingle()
    courseId = course?.id ?? null
    courseTitle = course?.title ?? null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('enquiries').insert({
    course_id: courseId,
    profile_id: user?.id ?? null,
    full_name: fullName,
    email,
    phone: (body.phone ?? '').trim() || null,
    message: (body.message ?? '').trim() || null,
    status: 'new',
  })

  if (error) {
    return NextResponse.json({ error: 'Could not record your enquiry.' }, { status: 500 })
  }

  void notifyAdmissions({ fullName, email, courseTitle })

  return NextResponse.json({ ok: true })
}

/** Best-effort admissions notification. A failure here never fails the enquiry. */
async function notifyAdmissions(input: {
  fullName: string
  email: string
  courseTitle: string | null
}) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.ENQUIRY_NOTIFY_EMAIL
  if (!key || !to) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tech Lab Academy <no-reply@techlabacademy.co>',
        to: [to],
        reply_to: input.email,
        subject: input.courseTitle
          ? `New enquiry: ${input.courseTitle}`
          : 'New enquiry',
        text: `${input.fullName} (${input.email}) asked about ${
          input.courseTitle ?? 'the academy'
        }. Open the console to respond: /admin/enquiries`,
      }),
    })
  } catch {
    // swallowed on purpose — the enquiry is already saved
  }
}
