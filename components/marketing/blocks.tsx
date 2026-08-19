import Link from 'next/link'
import { splitStat } from '@/lib/cms/schemas'
import { cldUrl } from '@/lib/cloudinary'
import { assetFallback } from '@/lib/content/defaults'
import type { ResolvedBlock } from '@/lib/queries'

/**
 * CMS block components.
 *
 * One per kind in `lib/cms/schemas.ts`. Adding a kind means a registry entry,
 * a component here, and a migration extending the `block_kind` enum.
 */

/** Cloudinary first, then the manifest's temporary CDN link. */
export function imageSrc(
  publicId: string | null | undefined,
  slot: Parameters<typeof cldUrl>[1]
): string | null {
  return cldUrl(publicId, slot) ?? assetFallback(publicId)
}

/** The green scrim over the hero photo. Keep it — the headline needs it. */
export const HERO_SCRIM =
  'linear-gradient(180deg, rgba(15,32,25,.72) 0%, rgba(15,32,25,.84) 62%, #0F2019 100%)'

export function heroBackground(publicId: string | null | undefined) {
  const url = imageSrc(publicId, 'hero')
  return url
    ? { backgroundImage: `${HERO_SCRIM}, url('${url}')` }
    : { backgroundImage: HERO_SCRIM }
}

export function HeroBlock({
  block,
  children,
}: {
  block: ResolvedBlock
  children?: React.ReactNode
}) {
  const f = block.fields
  return (
    <div className="container-site pt-24 pb-[60px] text-center max-stack:pt-16">
      {f.eyebrow ? (
        <div className="inline-flex items-center gap-2 bg-amber/12 text-amber text-label font-bold tracking-[.08em] uppercase px-4 py-2 rounded-pill mb-8">
          {f.eyebrow}
        </div>
      ) : null}
      <h1 className="font-display font-bold text-hero leading-[1.04] text-cream tracking-[-.02em] max-w-[900px] mx-auto mb-[26px]">
        {f.headline}
      </h1>
      {f.sub ? (
        <p className="text-lead leading-[1.6] text-on-ink max-w-[560px] mx-auto mb-10">{f.sub}</p>
      ) : null}
      {f.cta1 || f.cta2 ? (
        <div className="flex gap-4 justify-center mb-[70px] flex-wrap">
          {f.cta1 ? (
            <Link
              href="/courses"
              className="bg-amber text-ink px-[30px] py-4 rounded-sm text-[15px] font-bold"
            >
              {f.cta1}
            </Link>
          ) : null}
          {f.cta2 ? (
            <Link
              href="/business"
              className="border-[1.5px] border-[rgba(244,251,232,.3)] text-cream px-[30px] py-4 rounded-sm text-[15px] font-bold"
            >
              {f.cta2}
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

/** The stat bar under the hero. Each value is `figure · label`. */
export function StatsBlock({ block, onInk = true }: { block: ResolvedBlock; onInk?: boolean }) {
  const values = ['s1', 's2', 's3', 's4']
    .map((k) => block.fields[k])
    .filter((v): v is string => Boolean(v && v.trim()))

  return (
    <div
      className={
        onInk
          ? 'grid grid-cols-4 max-w-[900px] mx-auto border-t border-line-on-ink pt-9 max-[560px]:grid-cols-2 max-[560px]:gap-6'
          : 'container-site grid grid-cols-4 gap-5 text-center max-[560px]:grid-cols-2'
      }
    >
      {values.map((value) => {
        const { figure, label } = splitStat(value)
        return (
          <div key={value}>
            <div
              className={`font-display font-bold text-stat ${onInk ? 'text-amber' : 'text-ink'}`}
            >
              {figure}
            </div>
            <div className={`text-label mt-1 ${onInk ? 'text-on-ink' : 'text-muted'}`}>{label}</div>
          </div>
        )
      })}
    </div>
  )
}

/** Four track cards, each linking into the catalogue pre-filtered. */
export function TracksBlock({ block }: { block: ResolvedBlock }) {
  const cards = [1, 2, 3, 4].map((n, i) => ({
    title: block.fields[`t${n}`] ?? '',
    blurb: block.fields[`b${n}`] ?? '',
    image: block.cardImages[i] ?? null,
    track: ['Marketing', 'Design', 'Development', 'Automation'][i]!,
  }))

  return (
    <div className="bg-cream py-[88px]">
      <div className="container-site">
        <div className="flex justify-between items-end mb-11 flex-wrap gap-4">
          <h2 className="font-display font-bold text-h2 text-ink tracking-[-.01em]">
            {block.fields.title}
          </h2>
          <Link href="/courses" className="text-body text-ink font-bold">
            View all programs →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[18px] max-stack:grid-cols-1">
          {cards.map((card) => {
            const url = imageSrc(card.image, 'card')
            return (
              <Link
                key={card.track}
                href={`/courses?track=${card.track}`}
                className="bg-ink rounded-2xl p-[26px]"
              >
                <div
                  className="rounded-md h-[110px] mb-5 bg-cover bg-center bg-on-ink-4/20"
                  style={url ? { backgroundImage: `url('${url}')` } : undefined}
                />
                <div className="text-base font-bold text-cream mb-2">{card.title}</div>
                <div className="text-meta text-on-ink leading-[1.5]">{card.blurb}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Five numbered steps, 01–05, amber numerals. */
export function StepsBlock({ block }: { block: ResolvedBlock }) {
  const steps = [1, 2, 3, 4, 5]
    .map((n) => block.fields[`step${n}`])
    .filter((s): s is string => Boolean(s))

  return (
    <div className="bg-ink py-[88px]">
      <div className="container-site">
        <h2 className="font-display font-bold text-h3 text-cream text-center mb-14">
          {block.fields.title}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-5">
          {steps.map((step, i) => (
            <div key={step} className="text-center">
              <div className="font-display font-bold text-[30px] text-amber mb-3">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-body font-semibold text-cream">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProofBlock({ block }: { block: ResolvedBlock }) {
  const quotes = [1, 2, 3]
    .map((n) => ({
      quote: block.fields[`quote${n}`] ?? '',
      attr: block.fields[`attr${n}`] ?? '',
    }))
    .filter((q) => q.quote)

  if (!quotes.length) return null

  return (
    <div className="bg-cream pt-[88px]">
      <div className="container-site">
        <h2 className="font-display font-bold text-h3 text-ink text-center mb-14">
          {block.fields.title}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px]">
          {quotes.map((q) => (
            <figure
              key={q.attr}
              className="border-[1.5px] border-ink rounded-3xl p-7 flex flex-col"
            >
              <blockquote className="text-body text-body-soft leading-[1.65] flex-1">
                “{q.quote}”
              </blockquote>
              <figcaption className="text-label text-muted mt-5 font-semibold">
                {q.attr}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CtaBlock({ block }: { block: ResolvedBlock }) {
  return (
    <div className="bg-ink py-[88px]">
      <div className="container-site grid grid-cols-2 gap-5 max-stack:grid-cols-1">
        <div className="border-[1.5px] border-[rgba(244,251,232,.15)] rounded-3xl p-9">
          <div className="font-display font-bold text-[22px] text-cream mb-3">
            For Teams &amp; Organisations
          </div>
          <div className="text-ui text-on-ink leading-[1.6] mb-[22px]">
            Book a discovery call to explore a custom cohort program tailored to your goals and
            timeline.
          </div>
          <Link
            href="/business"
            className="inline-block border-[1.5px] border-amber text-amber px-[22px] py-3 rounded-sm text-ui font-bold"
          >
            Book a Team Demo
          </Link>
        </div>
        <div className="border-[1.5px] border-[rgba(244,251,232,.15)] rounded-3xl p-9">
          <div className="font-display font-bold text-[22px] text-cream mb-3">
            {block.fields.title}
          </div>
          <div className="text-ui text-on-ink leading-[1.6] mb-[22px]">
            Browse the full catalog and start building skills you can use from day one.
          </div>
          <Link
            href="/courses"
            className="inline-block bg-amber text-ink px-[22px] py-3 rounded-sm text-ui font-bold"
          >
            {block.fields.btn}
          </Link>
        </div>
      </div>
    </div>
  )
}
