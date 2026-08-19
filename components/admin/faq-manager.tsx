'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FilterPill, StatusPill } from '@/components/ui'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import { FAQ_LIMITS, deleteFaq, moveFaq, setFaqLive, upsertFaq } from '@/lib/cms/faq-actions'
import { relativeTime } from '@/lib/format'

export type FaqRow = {
  id: string
  position: number
  question: string
  answer: string
  category: string
  isLive: boolean
  updatedAt: string
}

const CATEGORIES = ['Programs', 'Payments', 'Certificates', 'Campus'] as const

const inputClass =
  'w-full box-border px-3.5 py-3 rounded-md border-[1.5px] border-line-strong text-ui text-ink bg-white placeholder:text-muted-2 focus:outline-2 focus:outline-amber'

type Draft = {
  id?: string
  question: string
  answer: string
  category: string
  isLive: boolean
}

const EMPTY_DRAFT: Draft = { question: '', answer: '', category: 'Programs', isLive: true }

/**
 * The FAQ collection manager.
 *
 * Rows reorder with ↑↓ (disabled at the ends), expand to read the answer
 * (collapsed shows a single line with an ellipsis), and carry Edit / Hide /
 * Delete. Delete is always a modal and names the question.
 */
export function FaqManager({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pendingDelete, setPendingDelete] = useState<FaqRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = category === 'All' ? faqs : faqs.filter((f) => f.category === category)
    if (q) {
      list = list.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q))
    }
    return list
  }, [faqs, category, query])

  const liveCount = faqs.filter((f) => f.isLive).length

  async function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setBusy(true)
    setError(null)
    const result = await fn()
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return false
    }
    router.refresh()
    return true
  }

  return (
    <>
      <div className="flex justify-between items-start gap-[18px] mb-[26px] flex-wrap">
        <div>
          <div className="font-display font-bold text-admin-title text-ink mb-1">FAQs</div>
          <div className="text-body text-muted">
            {faqs.length} question{faqs.length === 1 ? '' : 's'} · {liveCount} live on the site
          </div>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search questions"
            className="w-[210px] box-border px-4 py-3 rounded-md border-[1.5px] border-line-strong text-ui bg-white focus:outline-2 focus:outline-amber"
          />
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="bg-ink text-cream px-[22px] py-[13px] rounded-md text-ui font-bold whitespace-nowrap cursor-pointer"
          >
            + New question
          </button>
        </div>
      </div>

      <div className="flex gap-2.5 mb-[22px] flex-wrap">
        {(['All', ...CATEGORIES] as const).map((tab) => (
          <FilterPill key={tab} active={tab === category} onClick={() => setCategory(tab)}>
            {tab}
          </FilterPill>
        ))}
      </div>

      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      <div className="text-label text-muted-2 mb-3">
        Order here is the order visitors see on the site.
      </div>

      {visible.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-[rgba(15,32,25,.22)] rounded-3xl px-6 py-14 text-center">
          <div className="font-display font-bold text-lg text-ink mb-2">
            {faqs.length === 0 ? 'No questions yet' : `Nothing in ${category}`}
          </div>
          <div className="text-[13.5px] text-muted mb-5">
            {faqs.length === 0
              ? 'Add the questions people ask before enrolling.'
              : 'Switch category to see the rest of the collection.'}
          </div>
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="inline-block bg-ink text-cream px-5 py-[11px] rounded-md text-[13.5px] font-bold cursor-pointer"
          >
            + New question
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map((faq) => {
            const orderIndex = faqs.findIndex((f) => f.id === faq.id)
            const atTop = orderIndex === 0
            const atBottom = orderIndex === faqs.length - 1
            const isOpen = expanded === faq.id
            return (
              <div
                key={faq.id}
                className="bg-white border border-line rounded-3xl px-5 py-4 flex gap-4 items-start"
              >
                <div className="flex flex-col gap-0.5 flex-none pt-0.5">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={atTop || busy}
                    onClick={() => run(() => moveFaq(faq.id, 'up'))}
                    className={`w-6 h-5 text-meta leading-none rounded-xs ${
                      atTop ? 'text-ink/20 cursor-default' : 'text-ink cursor-pointer hover:bg-ink/5'
                    }`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={atBottom || busy}
                    onClick={() => run(() => moveFaq(faq.id, 'down'))}
                    className={`w-6 h-5 text-meta leading-none rounded-xs ${
                      atBottom
                        ? 'text-ink/20 cursor-default'
                        : 'text-ink cursor-pointer hover:bg-ink/5'
                    }`}
                  >
                    ↓
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="flex-1 min-w-0 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span className="text-body font-semibold text-ink">{faq.question}</span>
                    <StatusPill tone={faq.isLive ? 'live' : 'draft'}>
                      {faq.isLive ? 'Live' : 'Hidden'}
                    </StatusPill>
                  </div>
                  <div
                    className={`text-meta text-muted leading-[1.6] ${
                      isOpen ? '' : 'truncate whitespace-nowrap overflow-hidden'
                    }`}
                  >
                    {faq.answer}
                  </div>
                  <div className="text-micro text-muted-2 mt-1.5">
                    {faq.category} · updated {relativeTime(faq.updatedAt)}
                  </div>
                </button>

                <div className="flex gap-3 flex-none items-start pt-0.5 flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        id: faq.id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category,
                        isLive: faq.isLive,
                      })
                    }
                    className="text-meta font-bold text-ink cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => setFaqLive(faq.id, !faq.isLive))}
                    className="text-meta font-bold text-muted cursor-pointer"
                  >
                    {faq.isLive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(faq)}
                    className="text-meta font-bold text-amber-deep cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Editor modal */}
      {draft ? (
        <div
          className="fixed inset-0 bg-ink/50 flex items-center justify-center p-6 z-50"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDraft(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={draft.id ? 'Edit question' : 'New question'}
            className="bg-white rounded-4xl p-8 max-w-[560px] w-full box-border max-h-[90vh] overflow-y-auto"
          >
            <div className="font-display font-bold text-xl text-ink mb-[22px]">
              {draft.id ? 'Edit question' : 'New question'}
            </div>

            <div className="flex flex-col gap-[18px]">
              <div>
                <div className="flex justify-between items-baseline mb-1.5 gap-3">
                  <label htmlFor="faq-question" className="text-label font-semibold text-ink">
                    Question
                  </label>
                  <span
                    className={`text-micro tabular-nums ${
                      draft.question.length > FAQ_LIMITS.question
                        ? 'text-amber-deep font-semibold'
                        : 'text-muted-2'
                    }`}
                  >
                    {draft.question.length} / {FAQ_LIMITS.question}
                  </span>
                </div>
                <input
                  id="faq-question"
                  value={draft.question}
                  onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                  placeholder="e.g. Do I need a laptop?"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1.5 gap-3">
                  <label htmlFor="faq-answer" className="text-label font-semibold text-ink">
                    Answer
                  </label>
                  <span
                    className={`text-micro tabular-nums ${
                      draft.answer.length > FAQ_LIMITS.answer
                        ? 'text-amber-deep font-semibold'
                        : 'text-muted-2'
                    }`}
                  >
                    {draft.answer.length} / {FAQ_LIMITS.answer}
                  </span>
                </div>
                <textarea
                  id="faq-answer"
                  rows={4}
                  value={draft.answer}
                  onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                  placeholder="Keep it to two or three sentences."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div>
                <div className="text-label font-semibold text-ink mb-2">Category</div>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <FilterPill
                      key={c}
                      active={draft.category === c}
                      onClick={() => setDraft({ ...draft, category: c })}
                    >
                      {c}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDraft({ ...draft, isLive: !draft.isLive })}
                className="flex items-center justify-between gap-4 pt-1.5 border-t border-line-soft cursor-pointer text-left w-full"
              >
                <span>
                  <span className="block text-ui font-semibold text-ink">Show on the site</span>
                  <span className="block text-label text-muted">
                    Hidden questions stay saved but don&rsquo;t appear publicly.
                  </span>
                </span>
                <span
                  role="switch"
                  aria-checked={draft.isLive}
                  className={`w-10 h-[22px] rounded-pill relative flex-none ${
                    draft.isLive ? 'bg-ink' : 'bg-ink/15'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full absolute top-[3px] ${
                      draft.isLive ? 'bg-amber right-[3px]' : 'bg-white left-[3px]'
                    }`}
                  />
                </span>
              </button>
            </div>

            {error ? (
              <div className="text-pill font-semibold text-amber-deep mt-4">{error}</div>
            ) : null}

            <div className="flex gap-2.5 justify-end mt-7 flex-wrap">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="border-[1.5px] border-line-strong text-ink px-5 py-3 rounded-md text-ui font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const ok = await run(() =>
                    upsertFaq({
                      id: draft.id,
                      question: draft.question,
                      answer: draft.answer,
                      category: draft.category,
                      isLive: draft.isLive,
                    })
                  )
                  if (ok) setDraft(null)
                }}
                className="bg-ink text-cream px-5 py-3 rounded-md text-ui font-bold cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Saving…' : draft.id ? 'Save changes' : 'Add question'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirmation — states the real consequence */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this question?"
        actions={
          <ConfirmActions
            keepLabel="Keep question"
            confirmLabel="Delete question"
            busy={busy}
            onKeep={() => setPendingDelete(null)}
            onConfirm={async () => {
              if (!pendingDelete) return
              const ok = await run(() => deleteFaq(pendingDelete.id))
              if (ok) setPendingDelete(null)
            }}
          />
        }
      >
        <strong className="text-ink">{pendingDelete?.question}</strong>
        <br />
        <br />
        It disappears from the site immediately. Hide it instead if you might need it later.
      </Modal>
    </>
  )
}
