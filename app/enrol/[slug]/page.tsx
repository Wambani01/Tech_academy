import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EnquiryForm } from '@/components/marketing/enquiry-form'
import { imageSrc } from '@/components/marketing/blocks'
import { getCourse } from '@/lib/queries'
import { formatKes } from '@/lib/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)
  return {
    title: course ? `Request a place — ${course.title}` : 'Request a place',
    robots: { index: false },
  }
}

export default async function EnrolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  const thumb = imageSrc(course.hero_id, 'thumb')

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-[1040px] mx-auto px-6 py-11">
        <Link
          href="/"
          className="font-display font-bold text-[17px] text-ink tracking-[-.01em] mb-9 block"
        >
          TECH LAB ACADEMY
        </Link>

        <h1 className="font-display font-bold text-[26px] text-ink mb-2">Request a place</h1>
        <p className="text-body text-muted mb-8 max-w-[560px]">
          Tell us who you are and admissions will confirm your cohort, the start date and how to
          pay.
        </p>

        <div className="grid grid-cols-[1.3fr_1fr] gap-8 max-stack:grid-cols-1">
          <EnquiryForm courseSlug={course.slug} />

          <div className="bg-white border border-line rounded-3xl p-[26px] h-fit">
            <div className="text-body font-bold text-ink mb-5">Your programme</div>
            <div className="flex gap-3.5 mb-5">
              <div
                className="w-16 h-16 flex-none rounded-xl bg-cover bg-center bg-ink/8"
                style={thumb ? { backgroundImage: `url('${thumb}')` } : undefined}
              />
              <div>
                <div className="text-ui font-bold text-ink leading-[1.3]">{course.title}</div>
                <div className="text-label text-muted mt-1">{course.duration}</div>
              </div>
            </div>
            <div className="flex justify-between text-[13.5px] text-body-soft py-3.5 border-t border-line-soft">
              <span>Track</span>
              <span className="font-semibold">{course.track}</span>
            </div>
            <div className="flex justify-between text-[13.5px] text-body-soft pb-3.5 border-b border-line-soft">
              <span>Level</span>
              <span className="font-semibold">{course.level}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink pt-3.5">
              <span>Cohort fee</span>
              <span>{formatKes(course.price_kes)}</span>
            </div>
            <div className="text-label text-muted-2 mt-2 leading-[1.55]">
              Payable after admissions confirms your place. Instalments available.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
