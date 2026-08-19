import type { Metadata } from 'next'
import { PageSubtitle, PageTitle, ProgressBar, StudentShell } from '@/components/student/student-shell'
import { requireProfile } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Certificates', robots: { index: false } }

export default async function CertificatesPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const [{ data: certificates }, { data: enrolments }] = await Promise.all([
    supabase
      .from('certificates')
      .select('id, serial, issued_at, courses(title)')
      .eq('profile_id', profile.id)
      .order('issued_at', { ascending: false }),
    supabase
      .from('enrollments')
      .select('progress_pct, courses(title, slug)')
      .eq('profile_id', profile.id)
      .eq('status', 'active'),
  ])

  const earned = certificates ?? []
  const inProgress = enrolments ?? []

  return (
    <StudentShell
      active="/certificates"
      user={{ fullName: profile.full_name, track: profile.track }}
    >
      <PageTitle>Certificates</PageTitle>
      <PageSubtitle>
        Proof of the skills you&rsquo;ve built — shareable with employers and clients.
      </PageSubtitle>

      <div className="text-meta font-bold tracking-[.05em] uppercase text-muted mb-4">
        Earned ({earned.length})
      </div>

      {earned.length === 0 ? (
        <div className="bg-white border border-line rounded-3xl px-8 py-12 text-center mb-11">
          <div className="font-display font-bold text-[17px] text-ink mb-1.5">
            No certificates yet
          </div>
          <div className="text-[13.5px] text-muted">
            Finish a programme and a verifiable certificate is issued automatically.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 mb-11 max-stack:grid-cols-1">
          {earned.map((cert) => (
            <div
              key={cert.id}
              className="bg-ink rounded-4xl p-8 relative overflow-hidden"
            >
              <div
                className="absolute inset-2.5 border-[1.5px] border-amber/40 rounded-xl pointer-events-none"
                aria-hidden
              />
              <div className="text-micro tracking-[.1em] uppercase text-amber mb-3.5">
                Certificate of Completion
              </div>
              <div className="font-display font-bold text-xl text-cream mb-2.5">
                {(cert.courses as { title: string } | null)?.title}
              </div>
              <div className="text-meta text-on-ink mb-[26px]">
                Awarded to {profile.full_name} · {formatDate(cert.issued_at)}
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <a
                  href={`/verify/${cert.serial}`}
                  className="bg-amber text-ink px-4 py-[9px] rounded-sm text-label font-bold"
                >
                  View &amp; print
                </a>
                <a
                  href={`/verify/${cert.serial}`}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-[rgba(244,251,232,.3)] text-cream px-4 py-[9px] rounded-sm text-label font-bold"
                >
                  Share link
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {inProgress.length > 0 ? (
        <>
          <div className="text-meta font-bold tracking-[.05em] uppercase text-muted mb-4">
            In progress
          </div>
          <div className="flex flex-col gap-3">
            {inProgress.map((row) => {
              const course = row.courses as { title: string; slug: string } | null
              return (
                <div
                  key={course?.slug}
                  className="bg-white border border-line rounded-2xl px-[22px] py-[18px] flex justify-between items-center gap-5 flex-wrap"
                >
                  <div>
                    <div className="text-body font-bold text-ink">{course?.title}</div>
                    <div className="text-label text-muted mt-0.5">
                      {row.progress_pct}% complete
                    </div>
                  </div>
                  <ProgressBar pct={row.progress_pct} className="w-[140px]" />
                </div>
              )
            })}
          </div>
        </>
      ) : null}
    </StudentShell>
  )
}
