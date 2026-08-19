'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { blockRegistry } from '@/lib/cms/schemas'
import { publishPage, saveBlockDraft } from '@/lib/cms/actions'
import { StatusPill } from '@/components/ui'
import { PLACEHOLDER_STRIPES } from '@/lib/cloudinary'
import type { BlockKind } from '@/types/database'

export type EditorBlock = {
  id: string
  position: number
  kind: BlockKind
  /** `draft_fields ?? fields` — the admin always edits the draft. */
  fields: Record<string, string>
  imageId: string | null
  imageAlt: string | null
  dirty: boolean
}

export type LibraryItem = {
  id: string
  publicId: string
  filename: string
  url: string | null
  meta: string
}

const inputClass =
  'w-full box-border px-3.5 py-3 rounded-md border-[1.5px] border-line-strong text-ui text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

/**
 * The CMS core.
 *
 * The block rail marks changed blocks with an amber dot; the form is generated
 * from the block registry's schema — never hand-built per block — with the
 * character counters reading their max straight off that schema.
 */
export function PageEditor({
  pageSlug,
  pageTitle,
  blocks: initialBlocks,
  library,
  lastPublished,
}: {
  pageSlug: string
  pageTitle: string
  blocks: EditorBlock[]
  library: LibraryItem[]
  lastPublished: string | null
}) {
  const router = useRouter()
  const [blocks, setBlocks] = useState(initialBlocks)
  const [activeId, setActiveId] = useState(initialBlocks[0]?.id ?? '')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerChoice, setPickerChoice] = useState<string | null>(null)
  const [busy, setBusy] = useState<'draft' | 'publish' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishedNow, setPublishedNow] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  const active = blocks.find((b) => b.id === activeId) ?? blocks[0]
  const dirtyCount = blocks.filter((b) => b.dirty).length

  const def = active ? blockRegistry[active.kind] : null

  const activeImage = useMemo(
    () => library.find((m) => m.id === active?.imageId) ?? null,
    [library, active?.imageId]
  )

  if (!active || !def) {
    return (
      <div className="bg-white border border-line rounded-3xl px-8 py-14 text-center">
        <div className="font-display font-bold text-[17px] text-ink mb-1.5">
          This page has no blocks yet
        </div>
        <div className="text-[13.5px] text-muted">
          Seed the page in the database, or add a block once the block picker ships.
        </div>
      </div>
    )
  }

  function patchActive(patch: Partial<EditorBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === active!.id ? { ...b, ...patch, dirty: true } : b))
    )
    setPublishedNow(false)
    setDraftSaved(false)
  }

  async function onSaveDraft() {
    setBusy('draft')
    setError(null)
    for (const block of blocks.filter((b) => b.dirty)) {
      const result = await saveBlockDraft({
        blockId: block.id,
        kind: block.kind,
        fields: block.fields,
        imageId: block.imageId,
        imageAlt: block.imageAlt,
        pageSlug,
      })
      if (!result.ok) {
        setBusy(null)
        setError(result.error)
        return
      }
    }
    setBusy(null)
    setDraftSaved(true)
  }

  async function onPublish() {
    setBusy('publish')
    setError(null)
    // Persist anything unsaved first, then flip drafts live.
    for (const block of blocks.filter((b) => b.dirty)) {
      const saved = await saveBlockDraft({
        blockId: block.id,
        kind: block.kind,
        fields: block.fields,
        imageId: block.imageId,
        imageAlt: block.imageAlt,
        pageSlug,
      })
      if (!saved.ok) {
        setBusy(null)
        setError(saved.error)
        return
      }
    }
    const result = await publishPage(pageSlug)
    setBusy(null)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBlocks((prev) => prev.map((b) => ({ ...b, dirty: false })))
    setPublishedNow(true)
    setDraftSaved(false)
    router.refresh()
  }

  const savedNote = publishedNow
    ? 'Published just now · live on techlabacademy.co'
    : dirtyCount
      ? `${dirtyCount} ${dirtyCount === 1 ? 'block' : 'blocks'} changed and not yet published`
      : draftSaved
        ? 'Draft saved · nothing to publish'
        : lastPublished
          ? `Last published ${lastPublished}`
          : 'Not published yet'

  return (
    <>
      <div className="flex justify-between items-start gap-5 flex-wrap mb-[26px]">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <div className="font-display font-bold text-[26px] text-ink">{pageTitle}</div>
            <StatusPill tone={dirtyCount ? 'pending' : 'live'}>
              {dirtyCount ? 'Draft changes' : 'Published'}
            </StatusPill>
          </div>
          <div className="text-[13.5px] text-muted">{savedNote}</div>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <Link
            href={pageSlug === 'home' ? '/' : `/${pageSlug}`}
            className="border-[1.5px] border-line-strong text-ink px-[18px] py-3 rounded-md text-[13.5px] font-bold"
          >
            Preview
          </Link>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={!dirtyCount || busy !== null}
            className={`border-[1.5px] border-line-strong px-[18px] py-3 rounded-md text-[13.5px] font-bold ${
              dirtyCount ? 'text-ink cursor-pointer' : 'text-ink/35 cursor-default'
            }`}
          >
            {busy === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={!dirtyCount || busy !== null}
            className={`px-5 py-3 rounded-md text-[13.5px] font-bold ${
              dirtyCount
                ? 'bg-ink text-cream cursor-pointer'
                : 'bg-ink/15 text-ink/45 cursor-default'
            }`}
          >
            {busy === 'publish' ? 'Publishing…' : dirtyCount ? 'Publish changes' : 'Published'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      <div className="flex gap-6 items-start max-stack:flex-col">
        {/* Block rail */}
        <div className="w-[260px] flex-none bg-white border border-line rounded-3xl overflow-hidden max-stack:w-full">
          <div className="text-micro font-bold tracking-[.06em] uppercase text-muted px-[18px] py-3.5 border-b border-line-soft">
            Page blocks
          </div>
          {blocks.map((block) => {
            const isActive = block.id === active.id
            const blockDef = blockRegistry[block.kind]
            return (
              <button
                type="button"
                key={block.id}
                onClick={() => setActiveId(block.id)}
                className="w-full text-left flex items-center justify-between gap-2.5 px-[18px] py-[13px] cursor-pointer border-b border-line-soft"
                style={{
                  background: isActive ? 'rgba(242,169,59,.14)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#F2A93B' : 'transparent'}`,
                }}
              >
                <span className="min-w-0">
                  <span
                    className={`block text-[13.5px] ${
                      isActive ? 'font-bold text-ink' : 'font-medium text-body-soft'
                    }`}
                  >
                    {blockDef.label}
                  </span>
                  <span className="block text-micro text-muted-2 truncate">
                    {blockDef.fields.length} field{blockDef.fields.length === 1 ? '' : 's'}
                    {blockDef.image ? ' · image' : ''}
                  </span>
                </span>
                {block.dirty ? (
                  <span
                    className="w-[7px] h-[7px] rounded-full bg-amber-deep flex-none"
                    aria-label="Changed and not yet published"
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Generated form */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="bg-white border border-line rounded-3xl p-7">
            <div className="font-display font-bold text-lg text-ink mb-1">{def.label}</div>
            <div className="text-meta text-muted mb-6">{def.hint}</div>

            {active.kind === 'faq' ? (
              <Link
                href="/admin/faqs"
                className="flex items-center justify-between gap-3 bg-amber/12 border border-[rgba(181,116,26,.28)] rounded-xl px-[18px] py-3.5 mb-6 text-[13.5px] font-bold text-[#5C4318]"
              >
                Manage the questions in the FAQ collection →
              </Link>
            ) : null}

            <div className="flex flex-col gap-5">
              {def.fields.map((field) => {
                const value = active.fields[field.name] ?? ''
                const over = value.length > field.max
                return (
                  <div key={field.name}>
                    <div className="flex justify-between items-baseline mb-1.5 gap-3">
                      <label
                        htmlFor={`${active.id}-${field.name}`}
                        className="text-label font-semibold text-ink"
                      >
                        {field.label}
                      </label>
                      <span
                        className={`text-micro tabular-nums ${
                          over ? 'text-amber-deep font-semibold' : 'text-muted-2'
                        }`}
                      >
                        {value.length} / {field.max}
                      </span>
                    </div>
                    {field.control === 'textarea' ? (
                      <textarea
                        id={`${active.id}-${field.name}`}
                        rows={3}
                        value={value}
                        onChange={(e) =>
                          patchActive({
                            fields: { ...active.fields, [field.name]: e.target.value },
                          })
                        }
                        className={`${inputClass} resize-y`}
                      />
                    ) : (
                      <input
                        id={`${active.id}-${field.name}`}
                        value={value}
                        onChange={(e) =>
                          patchActive({
                            fields: { ...active.fields, [field.name]: e.target.value },
                          })
                        }
                        className={inputClass}
                      />
                    )}
                  </div>
                )
              })}

              {def.image ? (
                <div>
                  <div className="text-label font-semibold text-ink mb-2">{def.image.label}</div>
                  <div className="flex gap-[18px] items-start flex-wrap">
                    <div
                      className="w-[196px] h-[110px] flex-none rounded-xl border border-[rgba(15,32,25,.12)] bg-center bg-cover"
                      style={
                        activeImage?.url
                          ? { backgroundImage: `url('${activeImage.url}')` }
                          : { background: PLACEHOLDER_STRIPES, backgroundColor: '#F1EFE6' }
                      }
                    />
                    <div className="flex-1 min-w-[180px]">
                      <div className="text-meta font-semibold text-ink mb-1">
                        {activeImage?.filename ?? 'No image set'}
                      </div>
                      <div className="text-pill text-muted-2 mb-3.5">
                        {activeImage?.meta ?? 'Pick one from the library'}
                      </div>
                      <div className="flex gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setPickerChoice(active.imageId)
                            setPickerOpen(true)
                          }}
                          className="border-[1.5px] border-ink text-ink px-4 py-2.5 rounded-md text-meta font-bold cursor-pointer"
                        >
                          {activeImage ? 'Replace image' : 'Choose image'}
                        </button>
                        {activeImage ? (
                          <button
                            type="button"
                            onClick={() => patchActive({ imageId: null })}
                            className="border-[1.5px] border-amber-deep/50 text-amber-deep px-4 py-2.5 rounded-md text-meta font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <label
                    htmlFor={`${active.id}-alt`}
                    className="block text-label font-semibold text-ink mt-5 mb-1.5"
                  >
                    Alt text
                  </label>
                  <input
                    id={`${active.id}-alt`}
                    value={active.imageAlt ?? ''}
                    onChange={(e) => patchActive({ imageAlt: e.target.value })}
                    placeholder="Describe the image for screen readers"
                    className={inputClass}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <div
          className="fixed inset-0 bg-ink/55 flex items-center justify-center p-6 z-50"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPickerOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose an image"
            className="bg-paper rounded-4xl w-full max-w-[720px] box-border overflow-hidden"
          >
            <div className="flex justify-between items-center gap-4 px-[26px] py-[22px] bg-white border-b border-line">
              <div>
                <div className="font-display font-bold text-lg text-ink">Choose an image</div>
                <div className="text-label text-muted">From your media library</div>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
                className="text-xl text-muted cursor-pointer px-2 py-1"
              >
                ×
              </button>
            </div>
            <div className="px-[26px] py-[22px] grid grid-cols-3 gap-3.5 max-h-[52vh] overflow-y-auto max-stack:grid-cols-2">
              {library.length === 0 ? (
                <div className="col-span-full text-ui text-muted text-center py-8">
                  The library is empty. Upload an image from the media library first.
                </div>
              ) : (
                library.map((item) => {
                  const selected = item.id === pickerChoice
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPickerChoice(item.id)}
                      className="bg-white rounded-2xl overflow-hidden cursor-pointer text-left"
                      style={{
                        border: selected ? '2px solid #F2A93B' : '1px solid rgba(15,32,25,.12)',
                        boxShadow: selected ? '0 0 0 3px rgba(242,169,59,.2)' : 'none',
                      }}
                    >
                      <div
                        className="h-[84px] bg-cover bg-center bg-ink/5"
                        style={item.url ? { backgroundImage: `url('${item.url}')` } : undefined}
                      />
                      <div className="text-pill font-semibold text-ink px-2.5 py-2 truncate">
                        {item.filename}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
            <div className="flex justify-between items-center gap-3 px-[26px] py-[18px] bg-white border-t border-line flex-wrap">
              <Link href="/admin/media" className="text-meta font-bold text-muted">
                Manage library →
              </Link>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="border-[1.5px] border-line-strong text-ink px-[18px] py-[11px] rounded-md text-[13.5px] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    patchActive({ imageId: pickerChoice })
                    setPickerOpen(false)
                  }}
                  className="bg-ink text-cream px-[18px] py-[11px] rounded-md text-[13.5px] font-bold cursor-pointer"
                >
                  Use image
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
