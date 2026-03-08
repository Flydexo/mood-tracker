/**
 * HTTP client for the mood-tracker backend API.
 * All requests require Bearer token authentication.
 */

import { getConfig } from './db.js'

async function getHeaders() {
  const apiKey = await getConfig('apiKey')
  console.log('[mood-tracker] getHeaders, apiKey:', apiKey ? `${apiKey.slice(0,4)}...` : 'null')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey || ''}`,
  }
}

async function getBaseUrl() {
  const serverUrl = await getConfig('serverUrl')
  return serverUrl ? serverUrl.replace(/\/$/, '') : ''
}

/**
 * Retry fetch with exponential backoff.
 * Returns { ok, data, status } — never throws.
 */
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options)
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, status: res.status, data }
    } catch (err) {
      lastError = err
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500))
      }
    }
  }
  return { ok: false, status: 0, data: {}, error: lastError?.message }
}

export async function syncMoodLogs(logs) {
  const [baseUrl, headers] = await Promise.all([getBaseUrl(), getHeaders()])
  if (!baseUrl) return { ok: false, error: 'Server URL not configured' }

  return fetchWithRetry(`${baseUrl}/api/mood-logs/batch`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ logs }),
  })
}

export async function syncWebsiteVisits(visits) {
  const [baseUrl, headers] = await Promise.all([getBaseUrl(), getHeaders()])
  if (!baseUrl) return { ok: false, error: 'Server URL not configured' }

  return fetchWithRetry(`${baseUrl}/api/website-visits/batch`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ visits }),
  })
}

export async function fetchSummary(from, to) {
  const [baseUrl, headers] = await Promise.all([getBaseUrl(), getHeaders()])
  if (!baseUrl) return null
  const res = await fetchWithRetry(
    `${baseUrl}/api/stats/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { headers }
  )
  return res.ok ? res.data : null
}

export async function fetchHourly(from, to, period) {
  const [baseUrl, headers] = await Promise.all([getBaseUrl(), getHeaders()])
  if (!baseUrl) return null
  const res = await fetchWithRetry(
    `${baseUrl}/api/stats/hourly?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&period=${period}`,
    { headers }
  )
  return res.ok ? res.data : null
}

export async function fetchDomainStats(domain, from, to) {
  const [baseUrl, headers] = await Promise.all([getBaseUrl(), getHeaders()])
  if (!baseUrl) return null
  const res = await fetchWithRetry(
    `${baseUrl}/api/stats/domain/${encodeURIComponent(domain)}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { headers }
  )
  return res.ok ? res.data : null
}

export async function checkConnection(url) {
  let baseUrl = url || await getBaseUrl()
  if (!baseUrl) return { ok: false, error: 'No server URL configured' }

  // Ensure protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = 'http://' + baseUrl
  }
  baseUrl = baseUrl.replace(/\/$/, '')

  const headers = await getHeaders()
  try {
    const res = await fetch(`${baseUrl}/`, { headers, signal: AbortSignal.timeout(5000) })
    if (res.ok) return { ok: true }
    return { ok: false, error: `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}
