/** Formatting helpers shared across the three surfaces. */

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

const DATE_TZ = 'Africa/Nairobi'

export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: DATE_TZ,
  })
}

export function formatShortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: DATE_TZ,
  })
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DATE_TZ,
  })
}

/** The date block used on the events rows: { day: '24', month: 'SEP' }. */
export function dateBlock(iso: string | Date): { day: string; month: string } {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: DATE_TZ }),
    month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: DATE_TZ }).toUpperCase(),
  }
}

/** Seconds → `12:04`, for lesson durations. */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds && seconds !== 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Byte count → `1.4 MB`, for the media library. */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

/** "3 days ago" / "just now", for activity logs and the publish stamp. */
export function relativeTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return formatShortDate(d)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Small classnames joiner — no dependency needed for what the designs use. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
