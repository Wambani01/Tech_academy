import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Enquiry received', robots: { index: false } }

export default function EnquiryReceivedPage() {
  return (
    <div className="bg-paper min-h-screen flex items-center justify-center p-6">
      <div className="max-w-[440px] text-center">
        <div className="w-16 h-16 rounded-full bg-forest text-cream text-[28px] font-bold flex items-center justify-center mx-auto mb-6">
          ✓
        </div>
        <div className="font-display font-bold text-[26px] text-ink mb-3">Enquiry received</div>
        <p className="text-body text-muted leading-[1.6] mb-8">
          Admissions will email you within two working days with your cohort dates and the payment
          options. Nothing has been charged.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/courses"
            className="inline-block bg-ink text-cream px-7 py-[15px] rounded-md text-body font-bold"
          >
            Browse more programs
          </Link>
          <Link
            href="/"
            className="inline-block border-[1.5px] border-ink text-ink px-7 py-[15px] rounded-md text-body font-bold"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
