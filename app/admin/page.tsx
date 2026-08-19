import Link from 'next/link'
import { AdminHeader, AdminShell } from '@/components/admin/admin-shell'
import { EnrolmentChart } from '@/components/admin/enrolment-chart'
import { getEnrolmentSeries, getKpis, getRecentEnrolments } from '@/lib/admin'
import { requireAdmin } from '@/lib/student'
import { formatKes, formatShortDate } from '@/lib/format'

export default async function AdminOverviewPage() {
  const admin = await requireAdmin()
  const [kpis, series, recent] = await Promise.all([
    getKpis(),
    getEnrolmentSeries(),
    getRecentEnrolments(),
  ])

  const cards = [
    { label: 'Active students', value: kpis.activeStudents.toLocaleString('en-KE') },
    { label: 'New enrolments (MTD)', value: kpis.newEnrolments.toLocaleString('en-KE') },
    {
      label: 'Completion rate',
      value: kpis.completionRate === null ? '—' : `${kpis.completionRate}%`,
    },
    { label: 'Open enquiries', value: kpis.openEnquiries.toLocaleString('en-KE') },
  ]

  return (
    <AdminShell active="/admin" user={{ fullName: admin.full_name }}>
      <AdminHeader title="Overview" subtitle="How the academy is performing this month." />

      <div className="grid grid-cols-4 gap-4 mb-9 max-stack:grid-cols-2">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-line rounded-2xl p-[22px]">
            <div className="text-label text-muted mb-2">{card.label}</div>
            <div className="font-display font-bold text-[26px] text-ink">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5 mb-9 max-stack:grid-cols-1">
        <div className="bg-white border border-line rounded-3xl p-6">
          <div className="text-body font-bold text-ink mb-4">Enrolments, last 6 months</div>
          <EnrolmentChart data={series} />
        </div>
        <div className="bg-white border border-line rounded-3xl p-6">
          <div className="text-body font-bold text-ink mb-4">Recent activity</div>
          {recent.length === 0 ? (
            <div className="text-meta text-muted">Nothing has happened yet this month.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {recent.map((row) => (
                <div key={row.id}>
                  <div className="text-meta text-ink">
                    <b>{(row.profiles as { full_name: string } | null)?.full_name}</b> enrolled in{' '}
                    {(row.courses as { title: string } | null)?.title}
                  </div>
                  <div className="text-micro text-on-ink-3">
                    {formatShortDate(row.enrolled_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-line rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center gap-4 px-6 py-[18px] border-b border-line-soft">
          <div className="text-body font-bold text-ink">Recent enrolments</div>
          <Link href="/admin/students" className="text-meta font-bold text-ink">
            View all students →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 640 }}>
            <div className="grid grid-cols-[1.3fr_1.3fr_1fr_1fr] px-6 py-3 text-micro font-bold tracking-[.05em] uppercase text-muted border-b border-line-soft">
              <div>Student</div>
              <div>Course</div>
              <div>Date</div>
              <div>Course fee</div>
            </div>
            {recent.length === 0 ? (
              <div className="px-6 py-12 text-center text-ui text-muted">
                No enrolments yet. Convert an enquiry to create the first one.
              </div>
            ) : (
              recent.map((row, i) => {
                const course = row.courses as { title: string; price_kes: number } | null
                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[1.3fr_1.3fr_1fr_1fr] px-6 py-3.5 text-[13.5px] text-ink ${
                      i === recent.length - 1 ? '' : 'border-b border-[rgba(15,32,25,.05)]'
                    }`}
                  >
                    <div>{(row.profiles as { full_name: string } | null)?.full_name}</div>
                    <div>{course?.title}</div>
                    <div>{formatShortDate(row.enrolled_at)}</div>
                    <div>{course ? formatKes(course.price_kes) : '—'}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
