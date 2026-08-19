import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { getEvents } from '@/lib/queries'
import { dateBlock, formatTime } from '@/lib/format'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Masterclasses & Events',
  description:
    'One-off masterclasses and short workshops — no long-term commitment, straight to the point.',
}

export default async function EventsPage() {
  const events = await getEvents()
  const upcoming = events.filter((e) => e.status === 'upcoming')
  const list = upcoming.length ? upcoming : events

  return (
    <>
      <div className="bg-ink">
        <SiteHeader active="/events" />
        <div className="container-site pt-24 pb-[72px]">
          <div className="inline-flex items-center gap-2 bg-amber/12 text-amber text-label font-bold tracking-[.08em] uppercase px-4 py-2 rounded-pill mb-7">
            Masterclasses &amp; Events
          </div>
          <h1 className="font-display font-bold text-h1 leading-[1.06] text-cream tracking-[-.02em] max-w-[760px] mb-5">
            Live sessions with people doing the work right now.
          </h1>
          <p className="text-[16.5px] leading-[1.6] text-on-ink max-w-[560px]">
            One-off masterclasses and short workshops — no long-term commitment, straight to the
            point.
          </p>
        </div>
      </div>

      <div className="bg-cream pt-14 pb-24">
        <div className="container-site flex flex-col gap-4">
          {list.length === 0 ? (
            <div className="border-[1.5px] border-dashed border-[rgba(15,32,25,.25)] rounded-3xl px-8 py-16 text-center">
              <div className="font-display font-bold text-[21px] text-ink mb-2.5">
                No sessions scheduled right now
              </div>
              <div className="text-ui text-muted leading-[1.6]">
                New masterclasses go up every month. Ask admissions what&rsquo;s next.
              </div>
            </div>
          ) : (
            list.map((event) => {
              const { day, month } = dateBlock(event.starts_at)
              const year = new Date(event.starts_at).getFullYear()
              const isPast = event.status === 'past'
              return (
                <div
                  key={event.slug}
                  className="grid grid-cols-[120px_1fr_auto] gap-7 items-center border-[1.5px] border-ink rounded-3xl px-7 py-6 max-stack:grid-cols-1 max-stack:gap-4"
                >
                  <div className="text-center max-stack:text-left">
                    <div className="font-display font-bold text-[26px] text-ink">{day}</div>
                    <div className="text-pill text-muted uppercase tracking-[.05em]">
                      {month} {year}
                    </div>
                  </div>
                  <div>
                    <span className="text-micro font-bold tracking-[.05em] uppercase text-ink bg-ink/8 px-2.5 py-[5px] rounded-pill mb-2.5 inline-block">
                      {event.track}
                    </span>
                    <div className="font-display text-lg font-bold text-ink mb-1.5">
                      {event.title}
                    </div>
                    <div className="text-[13.5px] text-muted">
                      {event.format.replace(', ', ' · ')} · {formatTime(event.starts_at)} EAT
                    </div>
                  </div>
                  {isPast ? (
                    <span className="text-[13.5px] font-bold text-muted-2 whitespace-nowrap">
                      Session closed
                    </span>
                  ) : (
                    <Link
                      href={`/events/${event.slug}/register`}
                      className="bg-ink text-cream px-[22px] py-3 rounded-sm text-[13.5px] font-bold whitespace-nowrap text-center"
                    >
                      Register
                    </Link>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="bg-ink py-20 text-center">
        <div className="container-site">
          <div className="font-display font-bold text-h3 text-cream mb-[18px]">
            Want a masterclass for your team?
          </div>
          <div className="text-body text-on-ink mb-[26px]">We run private sessions on request.</div>
          <Link
            href="/business"
            className="inline-block bg-amber text-ink px-[26px] py-3.5 rounded-sm text-body font-bold"
          >
            Talk to Us
          </Link>
        </div>
      </div>
    </>
  )
}
