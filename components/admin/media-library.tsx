'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { FilterPill } from '@/components/ui'
import { ASSET_CATEGORIES } from '@/lib/cloudinary'
import { Modal, ConfirmActions } from '@/components/ui/modal'
import { deleteMediaAsset, registerMediaAsset } from '@/lib/admin-actions'
import { formatBytes } from '@/lib/format'

export type MediaRow = {
  id: string
  publicId: string
  filename: string
  folder: string
  width: number | null
  height: number | null
  bytes: number | null
  alt: string | null
  url: string | null
  /** Pages whose blocks reference this asset — shown on the card. */
  usedOn: string[]
}

const FOLDERS = ['All', ...ASSET_CATEGORIES] as const

export function MediaLibrary({ assets }: { assets: MediaRow[] }) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [folder, setFolder] = useState<(typeof FOLDERS)[number]>('All')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<MediaRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = folder === 'All' ? assets : assets.filter((a) => a.folder === folder)
    if (q) list = list.filter((a) => `${a.filename} ${a.alt ?? ''}`.toLowerCase().includes(q))
    return list
  }, [assets, folder, query])

  async function onUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const target = folder === 'All' ? 'marketing' : folder

      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ folder: target }),
      })
      if (!signRes.ok) {
        const body = (await signRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Could not start the upload.')
      }
      const sign = (await signRes.json()) as {
        apiKey: string
        timestamp: number
        /** Namespaced Cloudinary folder — must match what the server signed. */
        uploadFolder: string
        /** Bare category, for media_assets.folder. */
        category: string
        signature: string
        uploadUrl: string
      }

      const form = new FormData()
      form.append('file', file)
      form.append('api_key', sign.apiKey)
      form.append('timestamp', String(sign.timestamp))
      form.append('folder', sign.uploadFolder)
      form.append('signature', sign.signature)

      const uploadRes = await fetch(sign.uploadUrl, { method: 'POST', body: form })
      if (!uploadRes.ok) throw new Error('Cloudinary rejected the upload.')
      const uploaded = (await uploadRes.json()) as {
        public_id: string
        width: number
        height: number
        bytes: number
        original_filename: string
        format: string
      }

      const result = await registerMediaAsset({
        publicId: uploaded.public_id,
        filename: `${uploaded.original_filename}.${uploaded.format}`,
        folder: sign.category,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
        alt: null,
      })
      if (!result.ok) throw new Error(result.error)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <>
      <div className="flex justify-between items-center gap-3 mb-[22px] flex-wrap">
        <div className="flex gap-2.5 flex-wrap">
          {FOLDERS.map((f) => (
            <FilterPill key={f} active={f === folder} onClick={() => setFolder(f)}>
              {f === 'All' ? 'All' : f[0]!.toUpperCase() + f.slice(1)}
            </FilterPill>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images…"
          aria-label="Search images"
          className="w-[220px] box-border px-4 py-3 rounded-md border-[1.5px] border-line-strong text-ui bg-white focus:outline-2 focus:outline-amber"
        />
      </div>

      {error ? (
        <div className="text-pill font-semibold text-amber-deep bg-amber/15 rounded-md px-3.5 py-3 mb-5">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
        {/* Upload tile */}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="border-[1.5px] border-dashed border-line-strong rounded-3xl min-h-[220px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-ink/40 disabled:opacity-60"
        >
          <span className="text-2xl text-muted-2">+</span>
          <span className="text-ui font-bold text-ink">
            {uploading ? 'Uploading…' : 'Upload image'}
          </span>
          <span className="text-pill text-muted-2 px-4 text-center">
            Goes to the {folder === 'All' ? 'marketing' : folder} folder
          </span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
          }}
        />

        {visible.map((asset) => (
          <div
            key={asset.id}
            className="bg-white border border-line rounded-3xl overflow-hidden flex flex-col"
          >
            <div
              className="h-[130px] bg-cover bg-center bg-ink/5"
              style={asset.url ? { backgroundImage: `url('${asset.url}')` } : undefined}
              role="img"
              aria-label={asset.alt ?? asset.filename}
            />
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-meta font-semibold text-ink truncate">{asset.filename}</div>
              <div className="text-pill text-muted-2 mb-2">
                {asset.width ?? '?'}×{asset.height ?? '?'} · {formatBytes(asset.bytes)}
              </div>
              <div className="text-micro text-muted-2 flex-1">
                {asset.usedOn.length
                  ? `Used on ${asset.usedOn.join(', ')}`
                  : 'Not used on any page'}
              </div>
              <button
                type="button"
                onClick={() => setPending(asset)}
                className="text-meta font-bold text-amber-deep cursor-pointer mt-3 text-left"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-5 text-center text-[13.5px] text-muted">
          {query.trim() ? `Nothing matches “${query.trim()}”.` : `No images in ${folder}.`}{' '}
          Upload new files, or clear the filters to see the whole library.
        </div>
      ) : null}

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Delete this image?"
        actions={
          <ConfirmActions
            keepLabel="Keep image"
            confirmLabel="Delete image"
            busy={busy}
            onKeep={() => setPending(null)}
            onConfirm={async () => {
              if (!pending) return
              setBusy(true)
              setError(null)
              const result = await deleteMediaAsset(pending.id)
              setBusy(false)
              if (!result.ok) setError(result.error)
              else {
                setPending(null)
                router.refresh()
              }
            }}
          />
        }
      >
        <strong className="text-ink">{pending?.filename}</strong>
        <br />
        <br />
        {pending && pending.usedOn.length > 0
          ? `It is live on ${pending.usedOn.join(', ')}. Those pages will fall back to the placeholder immediately.`
          : 'It is not used on any page, so nothing on the site changes.'}
      </Modal>
    </>
  )
}
