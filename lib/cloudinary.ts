/**
 * Cloudinary delivery helpers.
 *
 * Images render through the named transformations in the handoff
 * (`cms/block-registry.md` § Images) rather than raw URLs, so replacing an
 * asset in the library updates every usage.
 */

export type ImageSlot = 'hero' | 'card' | 'portrait' | 'thumb'

/**
 * Every asset this project owns is prefixed with this, because the Cloudinary
 * product environment is shared with another project. It is part of the
 * `public_id`, so it appears in delivery URLs and in `media_assets.public_id`.
 */
export const ASSET_NAMESPACE = 'tech-lab-academy'

/**
 * The media-library categories. These are the `media_assets.folder` values that
 * drive the filter pills — deliberately *not* namespaced, so the console reads
 * "marketing" rather than "tech-lab-academy/marketing".
 */
export const ASSET_CATEGORIES = ['marketing', 'courses', 'people'] as const
export type AssetCategory = (typeof ASSET_CATEGORIES)[number]

/** The Cloudinary upload folder for a category — the namespaced form. */
export function uploadFolderFor(category: AssetCategory): string {
  return `${ASSET_NAMESPACE}/${category}`
}

/** Named transformations, mirrored as explicit params so delivery works before
 *  the named transformations are created in the Cloudinary console. */
const SLOT_TRANSFORM: Record<ImageSlot, string> = {
  hero: 'c_fill,g_auto,w_2560,h_1440',
  card: 'c_fill,g_auto,w_800,h_450',
  portrait: 'c_fill,g_auto,w_800,h_600',
  thumb: 'c_fill,g_auto,w_160,h_160',
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

/**
 * Build a delivery URL for a Cloudinary `public_id`.
 * Returns null when the cloud is not configured or no asset is set, which is
 * the signal to render the striped placeholder.
 */
export function cldUrl(publicId: string | null | undefined, slot: ImageSlot): string | null {
  if (!publicId) return null

  // The seed ships temporary CDN links; pass absolute URLs through untouched so
  // the site renders before the Cloudinary migration lands.
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) return publicId

  if (!CLOUD_NAME) return null

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${SLOT_TRANSFORM[slot]}/f_auto,q_auto/${publicId}`
}

/** Adaptive-streaming source for a lesson video. */
export function cldVideoUrl(publicId: string | null | undefined): string | null {
  if (!publicId) return null
  if (publicId.startsWith('http')) return publicId
  if (!CLOUD_NAME) return null
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}.m3u8`
}

/** Poster frame for a lesson video. */
export function cldVideoPoster(publicId: string | null | undefined): string | null {
  if (!publicId || publicId.startsWith('http')) return null
  if (!CLOUD_NAME) return null
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0/f_auto,q_auto/${publicId}.jpg`
}

/** The striped placeholder from `Edit Page.dc.html`, for an empty image slot. */
export const PLACEHOLDER_STRIPES =
  'repeating-linear-gradient(45deg, rgba(15,32,25,.06) 0 10px, rgba(15,32,25,.03) 10px 20px)'
