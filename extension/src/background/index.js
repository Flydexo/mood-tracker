/**
 * Mood Tracker — Service Worker (Chrome Extension MV3)
 *
 * Responsibilities:
 * 1. Track time spent on active tab (every 10s via alarm)
 * 2. Detect tabs playing audio/video (chrome.tabs.query {audible: true})
 * 3. Save completed sessions to IndexedDB
 * 4. Show mood prompt every N minutes (default 30) via alarm
 * 5. Batch sync unsynced data to the server
 * 6. Notify user of sync status
 */

import {
  openDB,
  saveWebsiteVisit,
  saveMoodLog,
  getUnsyncedMoodLogs,
  getUnsyncedWebsiteVisits,
  markMoodLogsSynced,
  markWebsiteVisitsSynced,
  getConfig,
  setConfig,
} from '../lib/db.js'
import { syncMoodLogs, syncWebsiteVisits } from '../lib/api.js'
import { extractDomain, generateUUID } from '../lib/utils.js'

// ─── State (in-memory, reset on SW restart) ───────────────────────────────────

let activeSession = null // { tabId, url, domain, startTime, accActive, accMedia }
const mediaSessions = new Map() // tabId → { url, domain, startTime, accMedia }

// ─── Initialization ───────────────────────────────────────────────────────────

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', async (e) => {
  e.waitUntil(clients.claim())
  await openDB()
  setupAlarms()
})

async function setupAlarms() {
  // Tick every 10s to measure time
  chrome.alarms.create('tick', { periodInMinutes: 1 / 6 })

  // Mood check interval (default 30 min)
  const intervalMin = (await getConfig('moodCheckInterval')) || 30
  chrome.alarms.create('moodCheck', { periodInMinutes: Number(intervalMin) })

  // Sync every 5 minutes
  chrome.alarms.create('sync', { periodInMinutes: 5 })
}

// ─── Alarms ───────────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'tick') await onTick()
  if (alarm.name === 'moodCheck') await onMoodCheck()
  if (alarm.name === 'sync') await onSync()
})

async function onTick() {
  // Update active session accumulator
  if (activeSession) {
    activeSession.accActive += 10 // seconds per tick

    // Check if this tab is also audible
    try {
      const tabs = await chrome.tabs.query({ audible: true })
      const isAudible = tabs.some((t) => t.id === activeSession.tabId)
      if (isAudible) activeSession.accMedia += 10
    } catch {}
  }

  // Update all background media sessions (audible but not active tab)
  try {
    const audibleTabs = await chrome.tabs.query({ audible: true })
    for (const tab of audibleTabs) {
      if (!tab.url || tab.id === activeSession?.tabId) continue
      const domain = extractDomain(tab.url)
      if (!domain) continue

      if (!mediaSessions.has(tab.id)) {
        mediaSessions.set(tab.id, {
          tabId: tab.id,
          url: tab.url,
          domain,
          startTime: new Date().toISOString(),
          accMedia: 0,
        })
      }
      mediaSessions.get(tab.id).accMedia += 10
    }

    // Flush media sessions for tabs no longer audible
    for (const [tabId, session] of mediaSessions) {
      const stillAudible = audibleTabs.some((t) => t.id === tabId)
      if (!stillAudible && session.accMedia > 0) {
        await flushMediaSession(tabId, session)
        mediaSessions.delete(tabId)
      }
    }
  } catch {}
}

async function onMoodCheck() {
  // Re-create with updated interval from config
  const intervalMin = (await getConfig('moodCheckInterval')) || 30
  chrome.alarms.clear('moodCheck', () => {
    chrome.alarms.create('moodCheck', { periodInMinutes: Number(intervalMin) })
  })

  // Open the dashboard tab and send a message to show the mood prompt
  const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('dashboard.html') })
  if (tabs.length > 0) {
    chrome.tabs.update(tabs[0].id, { active: true })
    chrome.windows.update(tabs[0].windowId, { focused: true })
    chrome.tabs.sendMessage(tabs[0].id, { action: 'showMoodPrompt' })
  } else {
    // Open dashboard tab — mood prompt will auto-show via message
    const newTab = await chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })
    // Brief delay to let the page load before sending the message
    setTimeout(() => {
      chrome.tabs.sendMessage(newTab.id, { action: 'showMoodPrompt' }).catch(() => {})
    }, 1500)
  }
}

async function onSync() {
  await syncAll()
}

// ─── Tab tracking ─────────────────────────────────────────────────────────────

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // Flush the previous active session
  if (activeSession) {
    await flushActiveSession()
  }

  // Start a new session for the newly activated tab
  try {
    const tab = await chrome.tabs.get(tabId)
    startActiveSession(tab)
  } catch {}
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return
  if (!activeSession || activeSession.tabId !== tabId) return

  // URL changed in the active tab — flush the old session and start fresh
  if (tab.url && tab.url !== activeSession.url) {
    await flushActiveSession()
    startActiveSession(tab)
  }
})

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (activeSession?.tabId === tabId) {
    await flushActiveSession()
    activeSession = null
  }
  if (mediaSessions.has(tabId)) {
    const session = mediaSessions.get(tabId)
    if (session.accMedia > 0) await flushMediaSession(tabId, session)
    mediaSessions.delete(tabId)
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus — pause tracking but don't flush yet
    if (activeSession) {
      activeSession.paused = true
    }
  } else {
    if (activeSession?.paused) {
      activeSession.paused = false
      activeSession.startTime = new Date().toISOString()
    }
  }
})

function startActiveSession(tab) {
  const domain = extractDomain(tab.url)
  if (!domain) return

  activeSession = {
    tabId: tab.id,
    url: tab.url,
    domain,
    startTime: new Date().toISOString(),
    accActive: 0,
    accMedia: 0,
    paused: false,
  }
}

async function flushActiveSession() {
  if (!activeSession || activeSession.accActive < 1) {
    activeSession = null
    return
  }

  const session = activeSession
  activeSession = null

  try {
    await saveWebsiteVisit({
      clientId: generateUUID(),
      url: session.url,
      domain: session.domain,
      activeDuration: session.accActive,
      audioVideoDuration: session.accMedia,
      startTime: session.startTime,
      endTime: new Date().toISOString(),
      synced: false,
    })

    // Trigger sync if we've accumulated enough
    const unsynced = await getUnsyncedWebsiteVisits(1)
    if (unsynced.length >= 50) await syncAll()
  } catch (err) {
    console.error('[mood-tracker] Failed to save website visit:', err)
  }
}

async function flushMediaSession(tabId, session) {
  if (session.accMedia < 1) return
  try {
    await saveWebsiteVisit({
      clientId: generateUUID(),
      url: session.url,
      domain: session.domain,
      activeDuration: 0,
      audioVideoDuration: session.accMedia,
      startTime: session.startTime,
      endTime: new Date().toISOString(),
      synced: false,
    })
  } catch (err) {
    console.error('[mood-tracker] Failed to save media session:', err)
  }
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

let isSyncing = false

async function syncAll() {
  if (isSyncing) return
  isSyncing = true

  try {
    const [moodLogs, websiteVisits] = await Promise.all([
      getUnsyncedMoodLogs(50),
      getUnsyncedWebsiteVisits(50),
    ])

    let totalSynced = 0
    let hasFailed = false

    if (moodLogs.length > 0) {
      const result = await syncMoodLogs(
        moodLogs.map((l) => ({
          mood: l.mood,
          timestamp: l.timestamp,
          clientId: l.clientId,
        }))
      )

      if (result.ok) {
        const synced = moodLogs.map((l) => l.clientId)
        await markMoodLogsSynced(synced)
        totalSynced += synced.length
      } else {
        hasFailed = true
      }
    }

    if (websiteVisits.length > 0) {
      const result = await syncWebsiteVisits(
        websiteVisits.map((v) => ({
          url: v.url,
          domain: v.domain,
          activeDuration: v.activeDuration,
          audioVideoDuration: v.audioVideoDuration,
          startTime: v.startTime,
          endTime: v.endTime,
          clientId: v.clientId,
        }))
      )

      if (result.ok) {
        const synced = websiteVisits.map((v) => v.clientId)
        await markWebsiteVisitsSynced(synced)
        totalSynced += synced.length
      } else {
        hasFailed = true
      }
    }

    if (totalSynced > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Mood Tracker',
        message: `Synced ${totalSynced} record${totalSynced !== 1 ? 's' : ''} to server.`,
        silent: true,
      })
    }

    if (hasFailed) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Mood Tracker — Sync Issue',
        message: 'Some records failed to sync. Will retry next cycle.',
        silent: true,
      })
    }
  } finally {
    isSyncing = false
  }
}

// ─── Message handler (from dashboard/popup) ───────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'saveMoodLog') {
    saveMoodLog({ ...msg.data, synced: false })
      .then(() => syncAll())
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }))
    return true // async
  }

  if (msg.action === 'syncNow') {
    syncAll()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }))
    return true
  }

  if (msg.action === 'updateMoodInterval') {
    const intervalMin = msg.data.intervalMin
    setConfig('moodCheckInterval', intervalMin).then(() => {
      chrome.alarms.clear('moodCheck', () => {
        chrome.alarms.create('moodCheck', { periodInMinutes: Number(intervalMin) })
      })
      sendResponse({ ok: true })
    })
    return true
  }
})
