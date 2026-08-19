import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { CourseCatalogue } from '@/components/marketing/course-catalogue'
import { getPublishedCourses } from '@/lib/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Cohort-based, hands-on, and taught by practitioners. Filter by track to find your next program.',
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>
}) {
  const [courses, params] = await Promise.all([getPublishedCourses(), searchParams])

  return (
    <>
      <div className="bg-ink">
        <SiteHeader active="/courses" cta={{ href: '/sign-up', label: 'Start Learning' }} />
        <div className="container-site pt-20 pb-14">
          <div className="inline-flex items-center gap-2 bg-amber/12 text-amber text-label font-bold tracking-[.08em] uppercase px-4 py-2 rounded-pill mb-7">
            Programs
          </div>
          <h1 className="font-display font-bold text-h1 leading-[1.06] text-cream tracking-[-.02em] max-w-[760px] mb-5">
            Every track. One clear path from beginner to portfolio-ready.
          </h1>
          <p className="text-[16.5px] leading-[1.6] text-on-ink max-w-[560px]">
            Cohort-based, hands-on, and taught by practitioners. Filter by track to find your next
            program.
          </p>
        </div>
      </div>

      <CourseCatalogue courses={courses} defaultTrack={params.track ?? 'All'} />

      <div className="bg-ink py-20 text-center">
        <div className="container-site">
          <div className="font-display font-bold text-h3 text-cream mb-[18px]">
            Not sure which track is right for you?
          </div>
          <div className="text-body text-on-ink mb-[26px]">
            Talk to our admissions team — we&rsquo;ll help you pick.
          </div>
          <a
            href="mailto:hello@techlabacademy.co"
            className="inline-block bg-amber text-ink px-[26px] py-3.5 rounded-sm text-body font-bold"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </>
  )
}
