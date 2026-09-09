import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import {
  ASSET_CATEGORIES,
  uploadFolderFor,
  type AssetCategory,
} from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase/server'

const isCategory = (v: string | undefined): v is AssetCategory =>
  ASSET_CATEGORIES.includes(v as AssetCategory)

/**
 * Signed Cloudinary upload params. Admin only.
 *
 * The browser posts the file straight to Cloudinary with this signature, so the
 * API secret never leaves the server and large files never pass through Vercel.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Console access required.' }, { status: 403 })
  }

  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 503 })
  }

  const body = (await request.json().catch(() => ({}))) as { folder?: string }
  const fallback = process.env.CLOUDINARY_UPLOAD_FOLDER
  const category = (
    isCategory(body.folder)
      ? body.folder
      : isCategory(fallback)
        ? fallback
        : 'marketing'
  ) satisfies AssetCategory

  // Two different things, deliberately: `uploadFolder` is where the asset lands
  // in Cloudinary (namespaced, because the environment is shared), `category` is
  // what media_assets.folder stores and the console's filter pills read.
  const uploadFolder = uploadFolderFor(category)

  const timestamp = Math.floor(Date.now() / 1000)

  // Cloudinary signs the alphabetically-sorted params, secret appended.
  const toSign = `folder=${uploadFolder}&timestamp=${timestamp}`
  const signature = createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex')

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    uploadFolder,
    category,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  })
}
