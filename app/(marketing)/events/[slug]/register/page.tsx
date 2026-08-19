import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/marketing/site-header'
import { EventRegisterForm } from '@/components/marketing/event-register-form'
import { getEvents } from '@/lib/queries'
import { formatDate, formatTime } from '@/lib/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = (await getEvents()).find((e) => e.slug === slug)
  return { title: event ? `Register — ${event.title}` : 'Register' }
}

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = (await getEvents()).find((e) => e.slug === slug)
  if (!event) notFound()

  return (
    <>
      <div className="bg-ink">
        <SiteHeader active="/events" />
        <div className="container-site pt-16 pb-14">
          <Link href="/events" className="text-meta text-on-ink mb-4 inline-block">
            ← All events
          </Link>
          <span className="block">
            <span className="text-micro font-bold tracking-[.05em] uppercase text-amber bg-amber/12 px-[11px] py-[5px] rounded-pill">
              {event.track}
            </span>
          </span>
          <h1 className="font-display font-bold text-[clamp(28px,4vw,42px)] leading-[1.1] text-cream mt-4 mb-3 max-w-[720px]">
            {event.title}
          </h1>
          <div className="text-body text-on-ink">
            {formatDate(event.starts_at)} · {formatTime(event.starts_at)} EAT ·{' '}
            {event.format.replace(', ', ' · ')}
          </div>
        </div>
      </div>

      <div className="bg-cream py-14">
        <div className="container-site grid grid-cols-[1fr_420px] gap-10 items-start max-stack:grid-cols-1">
          <div>
            <h2 className="font-display font-bold text-2xl text-ink mb-4">About this session</h2>
            <p className="text-body leading-[1.7] text-body-soft max-w-[560px]">
              {event.description ??
                'A short, practical session with time for questions at the end.'}
            </p>
          </div>
          {event.status === 'upcoming' ? (
            <EventRegisterForm eventSlug={event.slug} />
          ) : (
            <div className="bg-white border border-line rounded-3xl p-8">
              <div className="font-display font-bold text-lg text-ink mb-2">
                This session has finished
              </div>
              <div className="text-ui text-muted leading-[1.55] mb-5">
                Registration is closed. New masterclasses go up every month.
              </div>
              <Link
                href="/events"
                className="inline-block border-[1.5px] border-ink text-ink px-5 py-3 rounded-md text-ui font-bold"
              >
                See what&rsquo;s next
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
