import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

const STUDENT_PREFIXES = ['/dashboard', '/learn', '/assignments', '/certificates', '/settings']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Before Supabase is provisioned the public site must still render, so the
  // guards no-op rather than throwing. Student and admin routes are unreachable
  // anyway — they have no session to read.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not remove: this refreshes the auth token on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const needsStudent = STUDENT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const needsAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminSignIn = pathname === '/admin/sign-in'

  if (needsStudent && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (needsAdmin && !isAdminSignIn) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/sign-in'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/sign-in'
      url.searchParams.set('denied', '1')
      return NextResponse.redirect(url)
    }
  }

  return response
}
