'use client'

import { useState } from 'react'
import type { FaqItem } from '@/lib/queries'

/**
 * The public FAQ accordion.
 *
 * One open at a time, the first open on load, click a row to toggle. The
 * collapsed answer has zero height — the row collapses completely rather than
 * leaving a gap.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0)

  if (!items.length) return null

  return (
    <div className="max-w-[760px] mx-auto flex flex-col">
      {items.map((item, i) => {
        const isOpen = i === open
        const isLast = i === items.length - 1
        return (
          <div
            key={item.question}
            className={isLast ? '' : 'border-b-[1.5px] border-[rgba(15,32,25,.18)]'}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
              className="w-full text-left py-[22px] cursor-pointer"
            >
              <div className="flex items-start justify-between gap-5">
                <span className="text-[15.5px] font-bold text-ink leading-[1.4]">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="text-xl font-normal text-amber-deep flex-none leading-none transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : undefined }}
                >
                  +
                </span>
              </div>
              <div
                id={`faq-answer-${i}`}
                className="text-ui text-muted leading-[1.65] max-w-[640px] overflow-hidden transition-all duration-200"
                style={{
                  marginTop: isOpen ? '10px' : 0,
                  maxHeight: isOpen ? '200px' : 0,
                }}
              >
                {item.answer}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}
