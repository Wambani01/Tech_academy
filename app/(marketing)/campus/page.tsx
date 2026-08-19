import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { imageSrc } from '@/components/marketing/blocks'
import { findBlock, getPageBlocks } from '@/lib/queries'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getPageBlocks('campus')
  const meta = findBlock(blocks, 'meta')
  return { title: meta?.fields.title ?? 'Digital Campus', description: meta?.fields.desc }
}

const FEATURES = [
  ['Structured video lessons', 'Bite-sized, sequenced modules that build on each other.'],
  ['Real-world assignments', 'Every module ends in a deliverable, not a quiz.'],
  ['Certificates & digital badges', 'Shareable proof of what you completed and built.'],
  ['Ongoing alumni resources', 'Templates and updates long after your cohort wraps.'],
]

export default async function CampusPage() {
  const blocks = await getPageBlocks('campus')
  const hero = findBlock(blocks, 'hero')
  const previewUrl = imageSrc(hero?.image, 'card')

  return (
    <>
      <div className="bg-ink">
        <SiteHeader active="/campus" />
        <div className="container-site pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber/12 text-amber text-label font-bold tracking-[.08em] uppercase px-4 py-2 rounded-pill mb-8">
            {hero?.fields.eyebrow ?? 'Digital Campus'}
          </div>
          <h1 className="font-display font-bold text-[clamp(32px,4.8vw,58px)] leading-[1.06] text-cream tracking-[-.02em] max-w-[820px] mx-auto mb-[22px]">
            {hero?.fields.headline}
          </h1>
          <p className="text-[17px] leading-[1.6] text-on-ink max-w-[560px] mx-auto mb-10">
            {hero?.fields.sub}
          </p>
          <Link
            href="/courses"
            className="inline-block bg-amber text-ink px-[30px] py-4 rounded-sm text-[15px] font-bold"
          >
            {hero?.fields.cta1 ?? 'Explore Campus'}
          </Link>
        </div>
      </div>

      <div className="bg-cream py-[88px]">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {FEATURES.map(([title, blurb]) => (
            <div key={title} className="border-[1.5px] border-ink rounded-3xl p-7">
              <div className="text-base font-bold text-ink mb-2.5">{title}</div>
              <div className="text-[13.5px] text-muted leading-[1.6]">{blurb}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-ink py-[88px]">
        <div className="container-site grid grid-cols-2 gap-[60px] items-center max-stack:grid-cols-1 max-stack:gap-10">
          <div
            className="rounded-2xl min-h-[320px] bg-cover bg-center bg-on-ink-4/20"
            style={previewUrl ? { backgroundImage: `url('${previewUrl}')` } : undefined}
            role="img"
            aria-label="A student working through campus material in the evening"
          />
          <div>
            <h2 className="font-display font-bold text-h3 text-cream leading-[1.15] mb-[18px]">
              One dashboard for every lesson, template and milestone
            </h2>
            <p className="text-body leading-[1.6] text-on-ink mb-6">
              Track progress across programs, download templates as you go, and pick up exactly
              where you left off — on desktop or mobile.
            </p>
            <Link
              href="/dashboard"
              className="inline-block border-[1.5px] border-amber text-amber px-[22px] py-3.5 rounded-sm text-ui font-bold"
            >
              See a Sample Lesson
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-cream py-[88px] text-center">
        <div className="container-site">
          <div className="font-display font-bold text-h2 text-ink mb-[22px]">
            Your campus is one enrollment away
          </div>
          <Link
            href="/courses"
            className="inline-block bg-ink text-cream px-[30px] py-4 rounded-sm text-[15px] font-bold"
          >
            Browse All Courses
          </Link>
        </div>
      </div>
    </>
  )
}
