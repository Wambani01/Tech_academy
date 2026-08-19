import Link from 'next/link'
import type { Metadata } from 'next'
import {
  PageSubtitle,
  PageTitle,
  ProgressBar,
  StatCard,
  StudentShell,
} from '@/components/student/student-shell'
import { getDashboard, requireProfile } from '@/lib/student'

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false } }

export default async function DashboardPage() {
  const profile = await requireProfile()
  const data = await getDashboard(profile.id)

  const firstName = profile.full_name.split(' ')[0] || 'there'
  const isEmpty =
    data.inProgress.length === 0 &&
    data.coursesCompleted === 0 &&
    data.certificatesEarned === 0

  return (
    <StudentShell active="/dashboard" user={{ fullName: profile.full_name, track: profile.track }}>
      <PageTitle>Welcome back, {firstName}</PageTitle>
      <PageSubtitle>
        {isEmpty
          ? 'Your account is ready. Enrol in a track to get started.'
          : 'Pick up where you left off.'}
      </PageSubtitle>

      {isEmpty ? (
        <div className="bg-white border border-line rounded-3xl px-10 py-14 text-center max-w-[620px]">
          <div className="w-[52px] h-[52px] rounded-full bg-ink text-amber text-xl font-bold flex items-center justify-center mx-auto mb-5">
            ◆
          </div>
          <div className="font-display font-bold text-[21px] text-ink mb-2.5">
            You&rsquo;re not enrolled in a course yet
          </div>
          <div className="text-ui text-muted leading-[1.6] mb-7">
            Pick a track and your dashboard will fill up with lessons, assignments and progress.
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/courses"
              className="bg-ink text-cream px-6 py-[13px] rounded-md text-ui font-bold"
            >
              Browse Courses
            </Link>
            <Link
              href="/events"
              className="border-[1.5px] border-ink text-ink px-6 py-[13px] rounded-md text-ui font-bold"
            >
              See Free Masterclasses
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-11 max-stack:grid-cols-2">
            <StatCard figure={data.coursesInProgress} label="Courses in progress" />
            <StatCard figure={data.coursesCompleted} label="Courses completed" />
            <StatCard figure={data.certificatesEarned} label="Certificates earned" />
            <StatCard
              figure={data.avgScore === null ? '—' : `${data.avgScore}%`}
              label="Avg. assignment score"
            />
          </div>

          {data.inProgress.length > 0 ? (
            <>
              <div className="flex justify-between items-baseline mb-[18px] gap-4">
                <div className="font-display font-bold text-panel text-ink">Continue learning</div>
                <Link href="/certificates" className="text-[13.5px] font-bold text-ink">
                  View all courses →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-11 max-stack:grid-cols-1">
                {data.inProgress.map((course) => (
                  <Link
                    key={course.slug}
                    href={`/learn/${course.slug}/1`}
                    className="bg-white border border-line rounded-3xl p-[22px] block"
                  >
                    <span className="text-[11px] font-bold tracking-[.05em] uppercase text-ink bg-ink/6 px-[9px] py-1 rounded-pill">
                      {course.track}
                    </span>
                    <div className="text-[16.5px] font-bold text-ink mt-3 mb-3.5">
                      {course.title}
                    </div>
                    <ProgressBar pct={course.progressPct} className="mb-2" />
                    <div className="text-label text-muted">{course.progressPct}% complete</div>
                  </Link>
                ))}
              </div>
            </>
          ) : null}

          <div className="grid grid-cols-[1.3fr_1fr] gap-5 max-stack:grid-cols-1">
            <div>
              <div className="flex justify-between items-baseline mb-4 gap-4">
                <div className="font-display font-bold text-panel text-ink">
                  Upcoming assignments
                </div>
                <Link href="/assignments" className="text-[13.5px] font-bold text-ink">
                  See all →
                </Link>
              </div>
              <div className="bg-white border border-line rounded-3xl overflow-hidden">
                {data.upcoming.length === 0 ? (
                  <div className="px-5 py-9 text-ui text-muted text-center">
                    Nothing due right now.
                  </div>
                ) : (
                  data.upcoming.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex justify-between gap-4 px-5 py-4 ${
                        i === data.upcoming.length - 1 ? '' : 'border-b border-line-soft'
                      }`}
                    >
                      <div>
                        <div className="text-ui font-semibold text-ink">{item.title}</div>
                        <div className="text-pill text-muted">{item.course}</div>
                      </div>
                      <span className="text-pill font-bold text-amber-deep bg-amber/15 px-2.5 py-1 rounded-pill h-fit whitespace-nowrap">
                        {item.dueLabel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-4 gap-4">
                <div className="font-display font-bold text-panel text-ink">Certificates</div>
                <Link href="/certificates" className="text-[13.5px] font-bold text-ink">
                  View all →
                </Link>
              </div>
              <div className="bg-ink rounded-3xl p-5">
                <div className="text-[13.5px] text-on-ink leading-[1.6]">
                  {data.certificatesEarned === 0 ? (
                    'No certificates yet — finish a programme and one is issued automatically.'
                  ) : (
                    <>
                      {data.certificatesEarned} certificate
                      {data.certificatesEarned === 1 ? '' : 's'} earned. Your most recent:{' '}
                      <span className="text-cream font-bold">{data.latestCertificate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentShell>
  )
}
