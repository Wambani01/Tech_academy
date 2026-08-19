import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import {
  CtaBlock,
  HeroBlock,
  ProofBlock,
  StatsBlock,
  StepsBlock,
  TracksBlock,
  heroBackground,
} from '@/components/marketing/blocks'
import { findBlock, getLiveFaqs, getPageBlocks } from '@/lib/queries'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getPageBlocks('home')
  const meta = findBlock(blocks, 'meta')
  return {
    title: meta?.fields.title,
    description: meta?.fields.desc,
  }
}

export default async function HomePage() {
  const [blocks, faqs] = await Promise.all([getPageBlocks('home'), getLiveFaqs()])

  const hero = findBlock(blocks, 'hero')
  const stats = findBlock(blocks, 'stats')
  const tracks = findBlock(blocks, 'tracks')
  const steps = findBlock(blocks, 'steps')
  const proof = findBlock(blocks, 'proof')
  const faq = findBlock(blocks, 'faq')
  const cta = findBlock(blocks, 'cta')

  return (
    <>
      <div
        className="bg-ink bg-cover bg-[center_top] bg-no-repeat"
        style={hero ? heroBackground(hero.image) : undefined}
      >
        <SiteHeader />
        {hero ? (
          <HeroBlock block={hero}>{stats ? <StatsBlock block={stats} /> : null}</HeroBlock>
        ) : null}
      </div>

      {tracks ? <TracksBlock block={tracks} /> : null}

      {/* ---- For business ---- */}
      <div className="bg-cream pb-[88px]">
        <div className="container-site grid grid-cols-2 gap-10 items-center max-stack:grid-cols-1">
          <div className="bg-ink rounded-4xl p-12 max-stack:p-8">
            <div className="text-label font-bold tracking-[.08em] uppercase text-amber mb-3.5">
              For Teams
            </div>
            <div className="font-display font-bold text-[30px] text-cream leading-[1.15] mb-4">
              Upskill your team in weeks, not years.
            </div>
            <div className="text-body leading-[1.6] text-on-ink mb-6">
              Custom cohorts for marketing, design, dev &amp; ops teams — built around your stack
              and goals.
            </div>
            <Link
              href="/business"
              className="inline-block bg-amber text-ink px-6 py-3.5 rounded-sm text-body font-bold"
            >
              Book a Team Demo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              ['Marketing', 'Campaign automation'],
              ['Design', 'Brand systems & UX'],
              ['Development', 'AI-assisted builds'],
              ['Automation', 'Workflows & internal tools'],
            ].map(([title, blurb]) => (
              <div key={title} className="border-[1.5px] border-ink rounded-xl p-5">
                <div className="text-ui font-bold text-ink mb-1.5">{title}</div>
                <div className="text-label text-muted leading-[1.5]">{blurb}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {steps ? <StepsBlock block={steps} /> : null}
      {proof ? <ProofBlock block={proof} /> : null}

      {faq ? (
        <div className="bg-cream py-[88px]">
          <div className="container-site">
            <h2 className="font-display font-bold text-h3 text-ink text-center tracking-[-.01em] mb-3.5">
              {faq.fields.title}
            </h2>
            <p className="text-body text-muted text-center max-w-[520px] mx-auto mb-11 leading-[1.6]">
              {faq.fields.intro}
            </p>
            <FaqAccordion items={faqs} />
            <div className="text-center mt-9 text-[13.5px] text-muted">
              Still have a question?{' '}
              <Link href="/business" className="text-ink font-bold">
                Talk to admissions
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {cta ? <CtaBlock block={cta} /> : null}
    </>
  )
}
