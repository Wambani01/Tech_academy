import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { StatsBlock, imageSrc } from '@/components/marketing/blocks'
import { findBlock, getInstructors, getPageBlocks } from '@/lib/queries'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const blocks = await getPageBlocks('about')
  const meta = findBlock(blocks, 'meta')
  return { title: meta?.fields.title ?? 'About', description: meta?.fields.desc }
}

const APPROACH = [
  [
    'Practitioners, not lecturers',
    'Every instructor uses these tools in active, high-stakes work — not just teaches theory.',
  ],
  [
    'Real deliverables, not hypotheticals',
    'You leave every course with actual campaigns, designs, or apps — not just notes.',
  ],
  [
    'Structured, not scattered',
    'Clear milestones and feedback loops so you actually finish what you start.',
  ],
]

export default async function AboutPage() {
  const [blocks, instructors] = await Promise.all([getPageBlocks('about'), getInstructors()])
  const hero = findBlock(blocks, 'hero')
  const stats = findBlock(blocks, 'stats')
  const leads = instructors.filter((i) => i.role_title === 'Lead Instructor').slice(0, 4)

  return (
    <>
      <div className="bg-ink">
        <SiteHeader active="/about" />
        <div className="container-site pt-24 pb-[88px]">
          <div className="inline-flex items-center gap-2 bg-amber/12 text-amber text-label font-bold tracking-[.08em] uppercase px-4 py-2 rounded-pill mb-8">
            {hero?.fields.eyebrow ?? 'About Us'}
          </div>
          <h1 className="font-display font-bold text-[clamp(34px,5vw,58px)] leading-[1.06] text-cream tracking-[-.02em] max-w-[820px] mb-[26px]">
            {hero?.fields.headline}
          </h1>
          <p className="text-[17px] leading-[1.65] text-on-ink max-w-[600px]">{hero?.fields.sub}</p>
        </div>
      </div>

      {stats ? (
        <div className="bg-cream py-16 border-b border-[rgba(15,32,25,.08)]">
          <StatsBlock block={stats} onInk={false} />
        </div>
      ) : null}

      <div className="bg-cream py-[88px]">
        <div className="container-site grid grid-cols-[0.9fr_1.1fr] gap-[60px] max-stack:grid-cols-1 max-stack:gap-10">
          <div>
            <div className="text-label font-bold tracking-[.08em] uppercase text-ink mb-3.5">
              Our Approach
            </div>
            <h2 className="font-display font-bold text-[clamp(26px,3.2vw,34px)] text-ink leading-[1.15]">
              Strategy first, tools second.
            </h2>
          </div>
          <div className="flex flex-col gap-[22px]">
            {APPROACH.map(([title, blurb], i) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 flex-none rounded-xl bg-ink text-amber flex items-center justify-center font-display font-bold text-ui">
                  {i + 1}
                </div>
                <div>
                  <div className="text-[15.5px] font-bold text-ink mb-1">{title}</div>
                  <div className="text-[13.5px] text-muted leading-[1.6]">{blurb}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ink py-[88px]">
        <div className="container-site">
          <h2 className="font-display font-bold text-h3 text-cream mb-3">
            Taught by people who ship
          </h2>
          <p className="text-body text-on-ink mb-11 max-w-[520px]">
            A small, senior team of instructors across marketing, design, development and
            automation.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
            {leads.map((person) => {
              const url = imageSrc(person.photo_id, 'portrait')
              return (
                <div key={person.full_name}>
                  <div
                    className="rounded-2xl h-[180px] mb-4 bg-cover bg-center bg-on-ink-4/20"
                    style={url ? { backgroundImage: `url('${url}')` } : undefined}
                    role="img"
                    aria-label={`Portrait of ${person.full_name}`}
                  />
                  <div className="text-[15px] font-bold text-cream">{person.full_name}</div>
                  <div className="text-label text-on-ink">
                    Lead, {person.track} Track
                  </div>
                  {person.bio ? (
                    <div className="text-label text-on-ink-3 mt-1.5 leading-[1.5]">
                      {person.bio}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-cream py-[88px] text-center">
        <div className="container-site">
          <div className="font-display font-bold text-h2 text-ink mb-[22px]">
            Ready to build a provable skill?
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
