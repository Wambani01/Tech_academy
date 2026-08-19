import Link from 'next/link'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/queries'
import { formatDate } from '@/lib/format'
import { PrintButton } from '@/components/marketing/print-button'

/**
 * Public certificate verification.
 *
 * The serial is the public identifier printed on the certificate; anyone with
 * the link can confirm it, which is what makes it worth adding to a CV. The
 * page is also the printable copy — the browser's print dialogue saves the PDF,
 * so there is no server-side PDF pipeline to keep alive.
 *
 * RLS scopes `certificates` and `profiles` to their owner, so this one lookup
 * runs with the service role. It is deliberately narrow: an exact match on the
 * serial, returning only what is already printed on the certificate itself.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serial: string }>
}): Promise<Metadata> {
  const { serial } = await params
  return { title: `Verify certificate ${serial}`, robots: { index: false } }
}

type Verified = {
  serial: string
  issuedAt: string
  courseTitle: string
  holder: string
}

async function lookup(serial: string): Promise<Verified | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('certificates')
      .select('serial, issued_at, courses(title), profiles(full_name)')
      .eq('serial', serial)
      .maybeSingle()

    if (!data) return null
    return {
      serial: data.serial,
      issuedAt: data.issued_at,
      courseTitle: (data.courses as { title: string } | null)?.title ?? 'Programme',
      holder: (data.profiles as { full_name: string } | null)?.full_name ?? 'Graduate',
    }
  } catch {
    return null
  }
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ serial: string }>
}) {
  const { serial } = await params
  const certificate = await lookup(serial)

  if (!certificate) {
    return (
      <div className="bg-paper min-h-screen flex items-center justify-center p-6">
        <div className="max-w-[440px] text-center">
          <div className="font-display font-bold text-2xl text-ink mb-3">
            No certificate with that serial
          </div>
          <p className="text-body text-muted leading-[1.6] mb-8">
            Check the serial printed on the certificate. If it still doesn&rsquo;t resolve, the
            certificate may have been reissued — ask the holder for the current link.
          </p>
          <Link
            href="/"
            className="inline-block bg-ink text-cream px-7 py-[15px] rounded-md text-body font-bold"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-paper min-h-screen p-6 print:bg-white print:p-0">
      <div className="max-w-[720px] mx-auto pt-10 print:pt-0">
        <div className="text-center text-meta text-forest font-bold mb-5 print:hidden">
          ✓ Verified — this certificate was issued by Tech Lab Academy
        </div>

        <div className="bg-ink rounded-4xl p-14 relative overflow-hidden print:rounded-none">
          <div
            className="absolute inset-3 border-[1.5px] border-amber/40 rounded-xl pointer-events-none"
            aria-hidden
          />
          <div className="text-center">
            <div className="font-display font-bold text-base text-cream tracking-[-.01em] mb-9">
              TECH LAB ACADEMY
            </div>
            <div className="text-micro tracking-[.1em] uppercase text-amber mb-5">
              Certificate of Completion
            </div>
            <div className="text-label text-on-ink mb-2">This certifies that</div>
            <div className="font-display font-bold text-[28px] text-cream mb-5">
              {certificate.holder}
            </div>
            <div className="text-label text-on-ink mb-2">has completed</div>
            <div className="font-display font-bold text-xl text-cream mb-9">
              {certificate.courseTitle}
            </div>
            <div className="text-meta text-on-ink">
              Issued {formatDate(certificate.issuedAt)}
            </div>
            <div className="text-micro text-on-ink-3 mt-1.5 font-mono">
              Serial {certificate.serial}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-7 flex-wrap print:hidden">
          <PrintButton />
          <Link
            href="/courses"
            className="border-[1.5px] border-ink text-ink px-6 py-[13px] rounded-md text-ui font-bold"
          >
            Browse programs
          </Link>
        </div>
      </div>
    </div>
  )
}
