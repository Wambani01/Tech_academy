'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { adminInputClass } from '@/components/admin/form-kit'
import { saveCurriculum } from '@/lib/admin-actions'

export type BuilderLesson = { title: string; kind: string; videoId: string | null }
export type BuilderModule = { title: string; duration: string; lessons: BuilderLesson[] }

const KINDS = ['video', 'reading', 'exercise'] as const

/** Module and lesson builder. The whole tree is posted on save. */
export function CurriculumBuilder({
  courseId,
  initial,
}: {
  courseId: string
  initial: BuilderModule[]
}) {
  const router = useRouter()
  const [modules, setModules] = useState<BuilderModule[]>(
    initial.length ? initial : [{ title: '', duration: '', lessons: [] }]
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function patchModule(index: number, patch: Partial<BuilderModule>) {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
    setSaved(false)
  }

  function patchLesson(mi: number, li: number, patch: Partial<BuilderLesson>) {
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi
          ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) }
          : m
      )
    )
    setSaved(false)
  }

  async function onSave() {
    setBusy(true)
    setError(null)
    const result = await saveCurriculum(courseId, modules)
    setBusy(false)
    if (!result.ok) setError(result.error)
    else {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="max-w-form">
      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="text-pill font-semibold text-forest bg-forest/12 rounded-md px-3.5 py-3 mb-5">
          Curriculum saved.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {modules.map((mod, mi) => (
          <div key={mi} className="bg-white border border-line rounded-3xl p-6">
            <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
              <div className="text-label font-bold tracking-[.05em] uppercase text-muted">
                Module {mi + 1}
              </div>
              <button
                type="button"
                onClick={() => {
                  setModules((prev) => prev.filter((_, i) => i !== mi))
                  setSaved(false)
                }}
                className="text-meta font-bold text-amber-deep cursor-pointer"
              >
                Remove module
              </button>
            </div>

            <div className="grid grid-cols-[1fr_160px] gap-4 mb-5 max-stack:grid-cols-1">
              <input
                value={mod.title}
                onChange={(e) => patchModule(mi, { title: e.target.value })}
                placeholder="Module title"
                aria-label={`Module ${mi + 1} title`}
                className={adminInputClass}
              />
              <input
                value={mod.duration}
                onChange={(e) => patchModule(mi, { duration: e.target.value })}
                placeholder="45 min"
                aria-label={`Module ${mi + 1} duration`}
                className={adminInputClass}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              {mod.lessons.map((lesson, li) => (
                <div
                  key={li}
                  className="grid grid-cols-[1fr_140px_1fr_auto] gap-2.5 items-center max-stack:grid-cols-1"
                >
                  <input
                    value={lesson.title}
                    onChange={(e) => patchLesson(mi, li, { title: e.target.value })}
                    placeholder="Lesson title"
                    aria-label={`Lesson ${li + 1} title`}
                    className={adminInputClass}
                  />
                  <select
                    value={lesson.kind}
                    onChange={(e) => patchLesson(mi, li, { kind: e.target.value })}
                    aria-label={`Lesson ${li + 1} kind`}
                    className={adminInputClass}
                  >
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k[0]!.toUpperCase() + k.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    value={lesson.videoId ?? ''}
                    onChange={(e) => patchLesson(mi, li, { videoId: e.target.value || null })}
                    placeholder="Cloudinary video public_id"
                    aria-label={`Lesson ${li + 1} video`}
                    className={adminInputClass}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setModules((prev) =>
                        prev.map((m, i) =>
                          i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m
                        )
                      )
                      setSaved(false)
                    }}
                    aria-label={`Remove lesson ${li + 1}`}
                    className="text-meta font-bold text-amber-deep cursor-pointer px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patchModule(mi, {
                    lessons: [...mod.lessons, { title: '', kind: 'video', videoId: null }],
                  })
                }
                className="text-meta font-bold text-ink cursor-pointer self-start mt-1"
              >
                + Add lesson
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setModules((prev) => [...prev, { title: '', duration: '', lessons: [] }])
          setSaved(false)
        }}
        className="border-[1.5px] border-dashed border-line-strong text-muted w-full py-3.5 rounded-3xl text-ui font-bold cursor-pointer mt-4"
      >
        + Add module
      </button>

      <div className="flex gap-2.5 justify-end mt-7 flex-wrap">
        <Link
          href="/admin/courses"
          className="border-[1.5px] border-line-strong text-ink px-5 py-3 rounded-md text-ui font-bold"
        >
          Back to courses
        </Link>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="bg-ink text-cream px-5 py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save curriculum'}
        </button>
      </div>
    </div>
  )
}
