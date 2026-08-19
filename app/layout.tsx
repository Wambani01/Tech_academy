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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techlabacademy.co'

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
