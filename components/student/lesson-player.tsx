'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * The lesson video.
 *
 * Cloudinary delivers HLS (`f_auto` .m3u8). Safari plays it natively; other
 * browsers fall back to the progressive mp4 rendition, which Cloudinary serves
 * from the same public_id. When a lesson has no video yet the frame renders the
 * play affordance from the design rather than a broken player.
 */
export function LessonVideo({
  hlsSrc,
  mp4Src,
  poster,
  title,
}: {
  hlsSrc: string | null
  mp4Src: string | null
  poster: string | null
  title: string
}) {
  if (!hlsSrc && !mp4Src) {
    return (
      <div className="bg-ink rounded-3xl aspect-video flex items-center justify-center mb-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber flex items-center justify-center mx-auto mb-3">
            <span
              className="w-0 h-0 ml-1"
              style={{
                borderTop: '11px solid transparent',
                borderBottom: '11px solid transparent',
                borderLeft: '18px solid #0F2019',
              }}
            />
          </div>
          <div className="text-label text-on-ink">Video for this lesson is not published yet</div>
        </div>
      </div>
    )
  }

  return (
    <video
      controls
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      aria-label={title}
      className="bg-ink rounded-3xl aspect-video w-full mb-5"
    >
      {hlsSrc ? <source src={hlsSrc} type="application/x-mpegURL" /> : null}
      {mp4Src ? <source src={mp4Src} type="video/mp4" /> : null}
    </video>
  )
}

/** Marks the lesson complete and moves on. */
export function LessonNav({
  courseSlug,
  prevId,
  nextId,
  lessonId,
  profileId,
  isLast,
}: {
  courseSlug: string
  prevId: string | null
  nextId: string | null
  lessonId: string
  profileId: string
  isLast: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function onNext() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('lesson_progress').upsert({
      profile_id: profileId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    })
    setBusy(false)
    router.push(isLast ? '/certificates' : `/learn/${courseSlug}/${nextId}`)
    router.refresh()
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        type="button"
        disabled={!prevId}
        onClick={() => prevId && router.push(`/learn/${courseSlug}/${prevId}`)}
        className={`px-[22px] py-3 rounded-md text-ui font-bold border-[1.5px] ${
          prevId
            ? 'border-ink text-ink cursor-pointer'
            : 'border-line-strong text-ink/35 cursor-default'
        }`}
      >
        Previous
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={busy}
        className="bg-ink text-cream px-[22px] py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-50"
      >
        {busy ? 'Saving…' : isLast ? 'Finish Course' : 'Mark Complete & Continue'}
      </button>
    </div>
  )
}
