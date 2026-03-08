import { useState, useCallback, useEffect } from 'react'
import { fetchSummary, fetchHourly, fetchDomainStats } from '../lib/api.js'
import { getConfig } from '../lib/db.js'

export function useStats(from, to, period) {
  const [summary, setSummary] = useState(null)
  const [hourly, setHourly] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasServer, setHasServer] = useState(false)

  const reload = useCallback(async () => {
    if (!from || !to) return
    setLoading(true)
    setError(null)

    try {
      const serverUrl = await getConfig('serverUrl')
      if (!serverUrl) {
        setHasServer(false)
        return
      }
      setHasServer(true)

      const [sum, hrs] = await Promise.all([
        fetchSummary(from, to),
        fetchHourly(from, to, period),
      ])

      setSummary(sum)
      setHourly(hrs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [from, to, period])

  useEffect(() => {
    reload()
  }, [reload])

  return { summary, hourly, loading, error, hasServer, reload }
}

export function useDomainStats(domain, from, to) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!domain || !from || !to) return
    setLoading(true)
    fetchDomainStats(domain, from, to)
      .then(setData)
      .finally(() => setLoading(false))
  }, [domain, from, to])

  return { data, loading }
}
