import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { imageSrc } from '@/components/marketing/blocks'
import { findBlock, getPageBlocks } from '@/lib/queries'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getPageBlocks('business')
  const meta = findBlock(blocks, 'meta')
  return { title: meta?.fields.title ?? 'For Business', description: meta?.fields.desc }
}

const TEAM_TRACKS = [
  ['Marketing Teams', 'Content strategy, ad automation, analytics and AI-driven campaign execution.'],
  ['Design Teams', 'Visual concepts, brand systems, UX and AI-powered creative workflows.'],
  ['Dev Teams', 'Faster builds, AI-assisted coding, modern frameworks and deployment.'],
  ['No-Code & Ops', 'Internal tools, workflow automation and integrations without heavy engineering.'],
]

const STEPS = [
  ['Discovery call', "We learn your team's tools, goals and skill gaps."],
  ['Custom curriculum', 'We map a program to your stack and timeline.'],
  ['Cohort delivery', 'Live sessions, real projects, ongoing feedback.'],
  ['Certification & report-out', 'Certificates for every graduate, plus a team outcomes summary.'],
]

const STATS = [
  ['3×', 'Avg. output speed gained'],
  ['40+', 'Organisations trained'],
  ['4–12wk', 'Typical cohort length'],
]

export default async function BusinessPage() {
  const blocks = await getPageBlocks('business')
  const hero = findBlock(blocks, 'hero')
  const heroUrl = imageSrc(hero?.image, 'card')

  return (
    <>
      <div className="bg-ink">
        <SiteHeader active="/business" />
        <div className="container-site pt-24 pb-20 grid grid-cols-[1.1fr_0.9fr] gap-10 items-center max-stack:grid-cols-1">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber/12 text-amber text-label font-bold tracking-[.08em] uppercase px-4 py-2 rounded-pill mb-8">
              {hero?.fields.eyebrow ?? 'For Teams & Organisations'}
            </div>
            <h1 className="font-display font-bold text-[clamp(32px,4.5vw,54px)] leading-[1.06] text-cream tracking-[-.02em] mb-[22px]">
              {hero?.fields.headline}
            </h1>
            <p className="text-[16.5px] leading-[1.6] text-on-ink max-w-[480px] mb-8">
              {hero?.fields.sub}
            </p>
            <a
              href="mailto:hello@techlabacademy.co?subject=Team%20training%20enquiry"
              className="inline-block bg-amber text-ink px-7 py-4 rounded-sm text-[15px] font-bold"
            >
              {hero?.fields.cta1 ?? 'Book a Team Demo'}
            </a>
          </div>
          <div
            className="rounded-2xl min-h-[320px] bg-cover bg-center bg-on-ink-4/20"
            style={heroUrl ? { backgroundImage: `url('${heroUrl}')` } : undefined}
            role="img"
            aria-label="A team in a private training session"
          />
        </div>
      </div>

      <div className="bg-cream py-14 border-b border-[rgba(15,32,25,.08)]">
        <div className="container-site flex justify-center gap-16 flex-wrap text-center">
          {STATS.map(([figure, label]) => (
            <div key={label}>
              <div className="font-display font-bold text-[34px] text-ink">{figure}</div>
              <div className="text-meta text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-cream py-[88px]">
        <div className="container-site">
          <h2 className="font-display font-bold text-h2 text-ink mb-11">
            Training built around your team
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px]">
            {TEAM_TRACKS.map(([title, blurb]) => (
              <div key={title} className="bg-ink rounded-2xl p-7">
                <div className="text-base font-bold text-cream mb-2.5">{title}</div>
                <div className="text-[13.5px] text-on-ink leading-[1.6]">{blurb}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ink py-[88px]">
        <div className="container-site grid grid-cols-2 gap-[60px] max-stack:grid-cols-1 max-stack:gap-10">
          <div>
            <div className="text-label font-bold tracking-[.08em] uppercase text-amber mb-3.5">
              How it works
            </div>
            <h2 className="font-display font-bold text-h3 text-cream leading-[1.15]">
              From discovery call to graduation cohort
            </h2>
          </div>
          <div className="flex flex-col gap-[22px]">
            {STEPS.map(([title, blurb], i) => (
              <div key={title} className="flex gap-4">
                <div className="font-display font-bold text-amber text-xl flex-none w-[30px]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-cream mb-1">{title}</div>
                  <div className="text-[13.5px] text-on-ink leading-[1.6]">{blurb}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cream py-[88px] text-center">
        <div className="container-site">
          <div className="font-display font-bold text-h2 text-ink mb-3.5">
            Let&rsquo;s design your team&rsquo;s program
          </div>
          <div className="text-body text-muted mb-[26px]">
            30-minute discovery call — no obligation.
          </div>
          <a
            href="mailto:hello@techlabacademy.co?subject=Team%20training%20enquiry"
            className="inline-block bg-ink text-cream px-[30px] py-4 rounded-sm text-[15px] font-bold"
          >
            Book a Team Demo
          </a>
        </div>
      </div>
    </>
  )
}
