import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProgressBar, StudentShell } from '@/components/student/student-shell'
import { LessonNav, LessonVideo } from '@/components/student/lesson-player'
import { requireProfile } from '@/lib/student'
import { createClient } from '@/lib/supabase/server'
import { cldVideoPoster, cldVideoUrl } from '@/lib/cloudinary'

export const metadata: Metadata = { title: 'Course player', robots: { index: false } }

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = await params
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) notFound()

  const { data: modules } = await supabase
    .from('modules')
    .select('id, position, title, lessons(id, position, title, kind, video_id, body)')
    .eq('course_id', course.id)
    .order('position')

  // Flatten to the ordered lesson list the rail renders.
  const lessons = (modules ?? [])
    .flatMap((m) =>
      (m.lessons as Array<{
        id: string
        position: number
        title: string
        kind: string
        video_id: string | null
        body: string | null
      }>).map((l) => ({ ...l, modulePosition: m.position, moduleTitle: m.title }))
    )
    .sort((a, b) => a.modulePosition - b.modulePosition || a.position - b.position)

  if (lessons.length === 0) {
    return (
      <StudentShell active="/learn" user={{ fullName: profile.full_name, track: profile.track }} wide>
        <div className="text-label text-muted mb-1.5">{course.title}</div>
        <div className="font-display font-bold text-[22px] text-ink mb-5">
          This course has no lessons yet
        </div>
        <div className="text-ui text-muted max-w-[520px]">
          Your cohort&rsquo;s material is published module by module. Check back after the next
          live session.
        </div>
      </StudentShell>
    )
  }

  const index = lessons.findIndex((l) => l.id === lessonId)
  const activeIndex = index === -1 ? 0 : index
  const active = lessons[activeIndex]!

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('profile_id', profile.id)
    .not('completed_at', 'is', null)

  const done = new Set((progress ?? []).map((p) => p.lesson_id))
  const pct = Math.round((done.size / lessons.length) * 100)

  return (
    <StudentShell active="/learn" user={{ fullName: profile.full_name, track: profile.track }} wide>
      <div className="flex gap-7 max-stack:flex-col">
        <div className="flex-1 min-w-0">
          <div className="text-label text-muted mb-1.5">{course.title}</div>
          <h1 className="font-display font-bold text-[22px] text-ink mb-[18px]">{active.title}</h1>

          <LessonVideo
            hlsSrc={cldVideoUrl(active.video_id)}
            mp4Src={
              active.video_id && !active.video_id.startsWith('http')
                ? cldVideoUrl(active.video_id)?.replace('.m3u8', '.mp4') ?? null
                : active.video_id
            }
            poster={cldVideoPoster(active.video_id)}
            title={active.title}
          />

          <div className="flex gap-6 border-b-[1.5px] border-[rgba(15,32,25,.12)] mb-[22px] overflow-x-auto">
            <div className="pb-3 border-b-[2.5px] border-ink text-ui font-bold text-ink whitespace-nowrap">
              Overview
            </div>
            <Link
              href="/assignments"
              className="pb-3 text-ui font-semibold text-on-ink-3 whitespace-nowrap"
            >
              Assignments
            </Link>
          </div>

          <div className="text-body leading-[1.7] text-body-soft max-w-[640px] mb-6">
            {active.body ??
              'Lesson notes are published alongside the recording. Ask your instructor in the live session if anything is unclear.'}
          </div>

          <LessonNav
            courseSlug={course.slug}
            prevId={activeIndex > 0 ? lessons[activeIndex - 1]!.id : null}
            nextId={activeIndex < lessons.length - 1 ? lessons[activeIndex + 1]!.id : null}
            lessonId={active.id}
            profileId={profile.id}
            isLast={activeIndex === lessons.length - 1}
          />
        </div>

        <div className="w-[320px] flex-none max-stack:w-full">
          <div className="bg-white border border-line rounded-3xl p-5 mb-4">
            <div className="flex justify-between text-meta text-muted mb-2">
              <span>Course progress</span>
              <span className="font-bold text-ink">{pct}%</span>
            </div>
            <ProgressBar pct={pct} />
          </div>
          <div className="bg-white border border-line rounded-3xl overflow-hidden">
            <div className="px-[18px] py-3.5 text-label font-bold tracking-[.05em] uppercase text-muted border-b border-line-soft">
              Course content
            </div>
            {lessons.map((lesson, i) => {
              const isActive = i === activeIndex
              const isDone = done.has(lesson.id)
              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${course.slug}/${lesson.id}`}
                  className={`flex items-center gap-3 px-[18px] py-[13px] border-b border-line-soft last:border-b-0 ${
                    isActive ? 'bg-amber/12' : ''
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex-none flex items-center justify-center text-[11px] font-bold ${
                      isDone
                        ? 'bg-ink text-cream'
                        : isActive
                          ? 'bg-amber text-ink'
                          : 'bg-ink/10 text-muted'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </span>
                  <span
                    className={`text-[13.5px] ${
                      isActive ? 'font-bold text-ink' : 'font-medium text-body-soft'
                    }`}
                  >
                    {lesson.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </StudentShell>
  )
}
