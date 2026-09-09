#!/usr/bin/env node
/**
 * Environment doctor. Verifies that Supabase and Cloudinary are actually
 * reachable with the credentials in .env.local — not merely that the variables
 * are non-empty. Run with `npm run doctor`.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const env = {}
for (const file of ['.env.local', '.env']) {
  const path = resolve(root, file)
  if (!existsSync(path)) continue
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (env[m[1]] === undefined) env[m[1]] = v
  }
}

const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'
const WARN = '\x1b[33m!\x1b[0m'
let failed = 0

const line = (icon, label, note = '') =>
  console.log(`  ${icon} ${label}${note ? `  \x1b[2m${note}\x1b[0m` : ''}`)
const ok = (l, n) => line(PASS, l, n)
const bad = (l, n) => { failed++; line(FAIL, l, n) }
const warn = (l, n) => line(WARN, l, n)

const present = (k) => typeof env[k] === 'string' && env[k].length > 0

async function main() {
  console.log('\n\x1b[1mTech Lab Academy — environment doctor\x1b[0m')

  // ---- Supabase -------------------------------------------------------
  console.log('\n\x1b[1mSupabase\x1b[0m')
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = env.SUPABASE_SERVICE_ROLE_KEY

  if (!present('NEXT_PUBLIC_SUPABASE_URL')) {
    bad('NEXT_PUBLIC_SUPABASE_URL', 'missing — auth, student area and console are all disabled')
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
    warn('NEXT_PUBLIC_SUPABASE_URL', `unusual shape: ${url}`)
  } else {
    ok('NEXT_PUBLIC_SUPABASE_URL', url)
  }

  if (!present('NEXT_PUBLIC_SUPABASE_ANON_KEY')) bad('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'missing')
  else ok('NEXT_PUBLIC_SUPABASE_ANON_KEY', `${anon.slice(0, 12)}… (${anon.length} chars)`)

  if (!present('SUPABASE_SERVICE_ROLE_KEY')) {
    warn('SUPABASE_SERVICE_ROLE_KEY', 'missing — /verify/[serial] will return not-found')
  } else if (service === anon) {
    bad('SUPABASE_SERVICE_ROLE_KEY', 'identical to the anon key — wrong key copied')
  } else {
    ok('SUPABASE_SERVICE_ROLE_KEY', `${service.slice(0, 12)}… (${service.length} chars)`)
  }

  if (url && anon) {
    const base = url.replace(/\/$/, '')

    // Auth service reachable?
    try {
      const r = await fetch(`${base}/auth/v1/settings`, { headers: { apikey: anon } })
      if (r.ok) {
        const s = await r.json()
        ok('auth service reachable')
        s.external?.email === false
          ? bad('email/password sign-in', 'DISABLED in the Supabase dashboard')
          : ok('email/password sign-in', 'enabled')
        s.disable_signup === true
          ? bad('sign-ups', 'DISABLED — /sign-up cannot create accounts')
          : ok('sign-ups', 'enabled')
        s.mailer_autoconfirm === true
          ? ok('email confirmation', 'auto-confirm on — sign-up signs you straight in')
          : warn('email confirmation', 'REQUIRED — sign-up redirects to /dashboard but the session is not live until the link is clicked')
        s.external?.google === true
          ? ok('google oauth', 'configured')
          : warn('google oauth', 'not configured — the "Continue with Google" button will error')
      } else {
        bad('auth service reachable', `HTTP ${r.status}`)
      }
    } catch (e) {
      bad('auth service reachable', e.message)
    }

    // Schema applied?
    try {
      const r = await fetch(`${base}/rest/v1/profiles?select=id&limit=1`, {
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      })
      if (r.status === 200) ok('table "profiles" exists', 'migrations applied')
      else if (r.status === 404) bad('table "profiles"', 'NOT FOUND — migrations have not been applied')
      else if (r.status === 401 || r.status === 403) ok('table "profiles" exists', 'RLS blocks anon reads, as designed')
      else bad('table "profiles"', `HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`)
    } catch (e) {
      bad('table "profiles"', e.message)
    }

    // Seed loaded?
    try {
      const r = await fetch(`${base}/rest/v1/courses?select=id&limit=1`, {
        headers: { apikey: anon, Authorization: `Bearer ${anon}`, Prefer: 'count=exact', Range: '0-0' },
      })
      if (r.status === 404) bad('table "courses"', 'NOT FOUND — migrations have not been applied')
      else {
        const count = Number((r.headers.get('content-range') ?? '').split('/')[1])
        Number.isFinite(count) && count > 0
          ? ok('seed data', `${count} published course(s) readable by anon`)
          : warn('seed data', 'no anon-readable courses — supabase/seed.sql may not have run')
      }
    } catch (e) {
      warn('seed data', e.message)
    }

    // Service role actually elevated?
    if (service && service !== anon) {
      try {
        const r = await fetch(`${base}/rest/v1/certificates?select=id&limit=1`, {
          headers: { apikey: service, Authorization: `Bearer ${service}` },
        })
        r.ok ? ok('service role bypasses RLS') : bad('service role', `HTTP ${r.status}`)
      } catch (e) {
        bad('service role', e.message)
      }
    }
  }

  // ---- Cloudinary -----------------------------------------------------
  console.log('\n\x1b[1mCloudinary\x1b[0m')
  const cloud = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const key = env.CLOUDINARY_API_KEY
  const secret = env.CLOUDINARY_API_SECRET

  if (!present('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')) {
    warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'missing — images fall back to the seed CDN links')
  } else ok('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', cloud)

  if (!present('CLOUDINARY_API_KEY')) warn('CLOUDINARY_API_KEY', 'missing — media-library uploads return 503')
  else ok('CLOUDINARY_API_KEY', key)

  if (!present('CLOUDINARY_API_SECRET')) warn('CLOUDINARY_API_SECRET', 'missing — media-library uploads return 503')
  else ok('CLOUDINARY_API_SECRET', `${secret.slice(0, 4)}… (${secret.length} chars)`)

  if (cloud && key && secret) {
    try {
      const auth = Buffer.from(`${key}:${secret}`).toString('base64')
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/ping`, {
        headers: { Authorization: `Basic ${auth}` },
      })
      if (r.ok) ok('cloudinary credentials valid', 'ping ok')
      else if (r.status === 401) bad('cloudinary credentials', '401 — cloud name, key or secret is wrong')
      else bad('cloudinary credentials', `HTTP ${r.status}`)
    } catch (e) {
      bad('cloudinary credentials', e.message)
    }
  }

  // ---- Site ------------------------------------------------------------
  console.log('\n\x1b[1mSite\x1b[0m')
  present('NEXT_PUBLIC_SITE_URL')
    ? ok('NEXT_PUBLIC_SITE_URL', env.NEXT_PUBLIC_SITE_URL)
    : warn('NEXT_PUBLIC_SITE_URL', 'missing — auth redirects fall back to the production domain')
  present('RESEND_API_KEY')
    ? ok('RESEND_API_KEY', 'set')
    : warn('RESEND_API_KEY', 'missing — enquiries still save, the notification email is skipped')

  console.log(
    failed === 0
      ? '\n\x1b[32mReady.\x1b[0m Run `npm run dev`.\n'
      : `\n\x1b[31m${failed} blocking problem(s).\x1b[0m See above.\n`
  )
  process.exit(failed === 0 ? 0 : 1)
}

main()
