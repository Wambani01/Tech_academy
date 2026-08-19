import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/marketing/site-header'
import { imageSrc } from '@/components/marketing/blocks'
import { getCourse, getPublishedCourses } from '@/lib/queries'
import { formatKes } from '@/lib/format'

export const revalidate = 300

export async function generateStaticParams() {
  const courses = await getPublishedCourses()
  return courses.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) return { title: 'Program not found' }
  return { title: course.title, description: course.blurb }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  const heroUrl = imageSrc(course.hero_id, 'card')
  const weeks = course.duration.split('·')[0]?.trim() ?? course.duration

  return (
    <>
      <div className="bg-ink">
        <SiteHeader
          active="/courses"
          cta={{ href: `/enrol/${course.slug}`, label: 'Enroll Now' }}
        />
        <div className="container-site pt-16 pb-14 grid grid-cols-[1.4fr_1fr] gap-12 max-stack:grid-cols-1">
          <div>
            <Link href="/courses" className="text-meta text-on-ink mb-[18px] inline-block">
              ← All Programs
            </Link>
            <div>
              <span className="text-micro font-bold tracking-[.05em] uppercase text-amber bg-amber/12 px-[11px] py-[5px] rounded-pill">
                {course.track}
              </span>
            </div>
            <h1 className="font-display font-bold text-[clamp(30px,4vw,44px)] leading-[1.1] text-cream mt-[18px] mb-4">
              {course.title}
            </h1>
            <p className="text-base leading-[1.6] text-on-ink max-w-[520px] mb-6">
              {course.description ?? course.blurb}
            </p>
            <div className="flex gap-[22px] text-[13.5px] text-on-ink flex-wrap">
              <span>{course.level}</span>
              <span>{course.duration}</span>
            </div>
          </div>
          <div
            className="rounded-2xl min-h-[220px] bg-cover bg-center bg-on-ink-4/20"
            style={heroUrl ? { backgroundImage: `url('${heroUrl}')` } : undefined}
            role="img"
            aria-label={`${course.title} course preview`}
          />
        </div>
      </div>

      <div className="bg-cream pt-16 pb-24">
        <div className="container-site grid grid-cols-[1.4fr_1fr] gap-12 max-stack:grid-cols-1">
          <div>
            {course.outcomes.length > 0 ? (
              <>
                <h2 className="font-display font-bold text-2xl text-ink mb-5">
                  What you&rsquo;ll learn
                </h2>
                <div className="flex flex-col gap-3.5 mb-11">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex gap-3 text-body text-body-soft leading-[1.6]"
                    >
                      <span className="text-forest font-bold" aria-hidden>
                        ✓
                      </span>
                      {outcome}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <h2 className="font-display font-bold text-2xl text-ink mb-5">Curriculum</h2>
            {course.curriculum.length > 0 ? (
              <div className="flex flex-col border border-[rgba(15,32,25,.12)] rounded-3xl overflow-hidden">
                {course.curriculum.map((module, i) => (
                  <div
                    key={module.title}
                    className={`flex justify-between gap-4 px-5 py-4 ${
                      i === course.curriculum.length - 1
                        ? ''
                        : 'border-b border-line-soft'
                    }`}
                  >
                    <span className="text-ui font-semibold text-ink">
                      {i + 1}. {module.title}
                    </span>
                    <span className="text-meta text-muted whitespace-nowrap">
                      {module.duration}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[rgba(15,32,25,.12)] rounded-3xl px-5 py-8 text-ui text-muted">
                The full curriculum is published closer to the cohort start. Ask admissions for
                the current outline.
              </div>
            )}

            {course.instructor ? (
              <>
                <h2 className="font-display font-bold text-2xl text-ink mt-11 mb-5">
                  Your instructor
                </h2>
                <div className="flex gap-4 items-start border border-[rgba(15,32,25,.12)] rounded-3xl p-6">
                  <div
                    className="w-16 h-16 rounded-xl flex-none bg-cover bg-center bg-ink/8"
                    style={
                      imageSrc(course.instructor.photo_id, 'thumb')
                        ? {
                            backgroundImage: `url('${imageSrc(course.instructor.photo_id, 'thumb')}')`,
                          }
                        : undefined
                    }
                  />
                  <div>
                    <div className="text-[15.5px] font-bold text-ink">
                      {course.instructor.full_name}
                    </div>
                    <div className="text-label text-muted mb-2">
                      {course.instructor.role_title}
                    </div>
                    <div className="text-[13.5px] text-muted leading-[1.6]">
                      {course.instructor.bio}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div>
            <div className="bg-white border-[1.5px] border-ink rounded-4xl p-7 sticky top-6">
              <div className="font-display font-bold text-[30px] text-ink mb-1">
                {formatKes(course.price_kes)}
              </div>
              <div className="text-meta text-muted mb-[22px]">One-time · Lifetime access</div>
              <Link
                href={`/enrol/${course.slug}`}
                className="block text-center bg-ink text-cream py-[15px] rounded-md text-body font-bold mb-3.5"
              >
                Request a place
              </Link>
              <div className="text-label text-muted text-center mb-[22px]">
                Admissions will confirm your cohort by email
              </div>
              <div className="flex flex-col gap-2.5 border-t border-line pt-5">
                {[
                  ['Format', 'Cohort, live + recorded'],
                  ['Duration', weeks],
                  ['Certificate', 'Yes'],
                  ['Level', course.level],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 text-meta text-body-soft">
                    <span>{label}</span>
                    <span className="font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
