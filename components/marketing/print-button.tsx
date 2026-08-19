'use client'

/** Saving the certificate is the browser's print dialogue — no PDF service. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-ink text-cream px-6 py-[13px] rounded-md text-ui font-bold cursor-pointer"
    >
      Print or save as PDF
    </button>
  )
}
