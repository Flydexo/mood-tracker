/**
 * Extract the domain from a full URL.
 * Handles chrome://, extension://, and normal https URLs.
 */
export function extractDomain(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    // Ignore internal browser pages
    if (u.protocol === 'chrome:' || u.protocol === 'chrome-extension:' || u.protocol === 'about:') {
      return ''
    }
    return u.hostname
  } catch {
    return ''
  }
}

/**
 * Format seconds into human-readable duration (e.g. "2h 15m" or "45m").
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 60) return `${Math.round(seconds || 0)}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Generate a UUID v4.
 */
export function generateUUID() {
  return crypto.randomUUID()
}

/**
 * Get the start/end of a date range for a given period from today.
 */
export function getDateRange(period) {
  const now = new Date()
  const to = now.toISOString()
  let from

  switch (period) {
    case 'daily':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      break
    case 'weekly': {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      d.setHours(0, 0, 0, 0)
      from = d.toISOString()
      break
    }
    case 'monthly': {
      const d = new Date(now)
      d.setDate(d.getDate() - 29)
      d.setHours(0, 0, 0, 0)
      from = d.toISOString()
      break
    }
    case 'yearly': {
      const d = new Date(now)
      d.setDate(d.getDate() - 364)
      d.setHours(0, 0, 0, 0)
      from = d.toISOString()
      break
    }
    default:
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  }

  return { from, to }
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Format an ISO timestamp to a friendly date string.
 */
export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
