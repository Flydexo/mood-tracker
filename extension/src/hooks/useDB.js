import { useState, useCallback } from 'react'
import { getMoodLogs, getWebsiteVisits, getConfig, setConfig } from '../lib/db.js'

export function useConfig() {
  const [values, setValues] = useState({})

  const load = useCallback(async (...keys) => {
    const result = {}
    for (const key of keys) {
      result[key] = await getConfig(key)
    }
    setValues((prev) => ({ ...prev, ...result }))
    return result
  }, [])

  const save = useCallback(async (key, value) => {
    await setConfig(key, value)
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  return { values, load, save }
}

export function useLocalStats(from, to) {
  const [moodLogs, setMoodLogs] = useState([])
  const [websiteVisits, setWebsiteVisits] = useState([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!from || !to) return
    setLoading(true)
    try {
      const [logs, visits] = await Promise.all([getMoodLogs(from, to), getWebsiteVisits(from, to)])
      setMoodLogs(logs)
      setWebsiteVisits(visits)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  return { moodLogs, websiteVisits, loading, reload }
}
