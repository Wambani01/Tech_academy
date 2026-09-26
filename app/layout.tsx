import type { Metadata, Viewport } from 'next'
import { Public_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

/**
 * Absolute origin for metadata and auth redirects.
 *
 * `??` alone is not enough. An environment variable that is *defined but empty*
 * — which is how this was configured on Vercel — is a string, not undefined, so
 * it slips past a nullish fallback and reaches `new URL('')`. That throws
 * ERR_INVALID_URL during "Collecting page data" and fails the entire build with
 * a message that names /_not-found rather than the real culprit. Guard on
 * emptiness AND on parseability, so a malformed value degrades to the fallback
 * instead of taking the build down.
 *
 * VERCEL_PROJECT_PRODUCTION_URL is injected by Vercel and carries no scheme, so
 * preview and production deploys get a correct origin even when nothing is set.
 */
const FALLBACK_SITE_URL = 'https://techlabacademy.co'

function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
  ]

  for (const candidate of candidates) {
    const raw = candidate?.trim()
    if (!raw) continue
    try {
      return new URL(raw).origin
    } catch {
      // Malformed — try the next candidate rather than failing the build.
    }
  }

  return FALLBACK_SITE_URL
}

const siteUrl = resolveSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tech Lab Academy — practical tech training in Nairobi',
    template: '%s · Tech Lab Academy',
  },
  description:
    'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.',
  openGraph: {
    type: 'website',
    siteName: 'Tech Lab Academy',
    locale: 'en_KE',
    url: siteUrl,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0F2019',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${publicSans.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  )
}
