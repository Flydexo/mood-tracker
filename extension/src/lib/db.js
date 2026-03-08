/**
 * IndexedDB setup and CRUD helpers.
 * Database: "mood-tracker" v1
 * Stores:
 *   - moodLogs      { clientId (pk), mood, timestamp, synced }
 *   - websiteVisits { clientId (pk), url, domain, activeDuration, audioVideoDuration, startTime, endTime, synced }
 *   - syncQueue     { id (auto), type, payload, retries, nextRetry, lastError }
 *   - config        { key (pk), value }
 */

const DB_NAME = 'mood-tracker'
const DB_VERSION = 1

let _db = null

export async function openDB() {
  if (_db) return _db

  _db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result

      if (!db.objectStoreNames.contains('moodLogs')) {
        const store = db.createObjectStore('moodLogs', { keyPath: 'clientId' })
        store.createIndex('synced', 'synced')
        store.createIndex('timestamp', 'timestamp')
      }

      if (!db.objectStoreNames.contains('websiteVisits')) {
        const store = db.createObjectStore('websiteVisits', { keyPath: 'clientId' })
        store.createIndex('synced', 'synced')
        store.createIndex('startTime', 'startTime')
        store.createIndex('domain', 'domain')
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('nextRetry', 'nextRetry')
      }

      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  return _db
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

function txPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function reqPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getConfig(key) {
  const db = await openDB()
  const tx = db.transaction('config', 'readonly')
  const result = await reqPromise(tx.objectStore('config').get(key))
  return result?.value ?? null
}

export async function setConfig(key, value) {
  const db = await openDB()
  const tx = db.transaction('config', 'readwrite')
  await reqPromise(tx.objectStore('config').put({ key, value }))
}

// ─── Mood Logs ────────────────────────────────────────────────────────────────

export async function saveMoodLog(log) {
  const db = await openDB()
  const tx = db.transaction('moodLogs', 'readwrite')
  await reqPromise(tx.objectStore('moodLogs').put(log))
}

export async function getUnsyncedMoodLogs(limit = 50) {
  const db = await openDB()
  const tx = db.transaction('moodLogs', 'readonly')
  const store = tx.objectStore('moodLogs')
  const index = store.index('synced')
  const results = []
  await new Promise((resolve, reject) => {
    const req = index.openCursor(IDBKeyRange.only(false))
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (!cursor || results.length >= limit) return resolve()
      results.push(cursor.value)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
  return results
}

export async function markMoodLogsSynced(clientIds) {
  const db = await openDB()
  const tx = db.transaction('moodLogs', 'readwrite')
  const store = tx.objectStore('moodLogs')
  for (const id of clientIds) {
    const record = await reqPromise(store.get(id))
    if (record) {
      record.synced = true
      store.put(record)
    }
  }
  await txPromise(tx)
}

export async function getMoodLogs(from, to) {
  const db = await openDB()
  const tx = db.transaction('moodLogs', 'readonly')
  const store = tx.objectStore('moodLogs')
  const range = IDBKeyRange.bound(from, to)
  const index = store.index('timestamp')
  const results = []
  await new Promise((resolve, reject) => {
    const req = index.openCursor(range)
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (!cursor) return resolve()
      results.push(cursor.value)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
  return results
}

// ─── Website Visits ───────────────────────────────────────────────────────────

export async function saveWebsiteVisit(visit) {
  const db = await openDB()
  const tx = db.transaction('websiteVisits', 'readwrite')
  await reqPromise(tx.objectStore('websiteVisits').put(visit))
}

export async function getUnsyncedWebsiteVisits(limit = 50) {
  const db = await openDB()
  const tx = db.transaction('websiteVisits', 'readonly')
  const store = tx.objectStore('websiteVisits')
  const index = store.index('synced')
  const results = []
  await new Promise((resolve, reject) => {
    const req = index.openCursor(IDBKeyRange.only(false))
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (!cursor || results.length >= limit) return resolve()
      results.push(cursor.value)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
  return results
}

export async function markWebsiteVisitsSynced(clientIds) {
  const db = await openDB()
  const tx = db.transaction('websiteVisits', 'readwrite')
  const store = tx.objectStore('websiteVisits')
  for (const id of clientIds) {
    const record = await reqPromise(store.get(id))
    if (record) {
      record.synced = true
      store.put(record)
    }
  }
  await txPromise(tx)
}

export async function getWebsiteVisits(from, to) {
  const db = await openDB()
  const tx = db.transaction('websiteVisits', 'readonly')
  const store = tx.objectStore('websiteVisits')
  const range = IDBKeyRange.bound(from, to)
  const index = store.index('startTime')
  const results = []
  await new Promise((resolve, reject) => {
    const req = index.openCursor(range)
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (!cursor) return resolve()
      results.push(cursor.value)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
  return results
}
