import { useState, useEffect } from 'react'
import { getConfig, setConfig } from '../lib/db.js'
import { checkConnection } from '../lib/api.js'
import Card from './ui/Card.jsx'

const DEFAULT_INTERVAL = 30

function InputField({ label, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
        style={{
          background: 'var(--surface-base)',
          border: '1.5px solid var(--border)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--peach-400)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)'
        }}
      />
      {hint && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return null
  const cfg = {
    success: { bg: '#D4F0E6', text: '#1A6B47', icon: '✓' },
    error: { bg: '#FFE0E0', text: '#8B3A3A', icon: '✕' },
    info: { bg: 'var(--peach-100)', text: 'var(--text-secondary)', icon: 'ℹ' },
  }[status.type] || {}

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="font-bold">{cfg.icon}</span>
      <span>{status.message}</span>
    </div>
  )
}

export default function Settings() {
  const [serverUrl, setServerUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [interval, setInterval] = useState(String(DEFAULT_INTERVAL))
  const [showApiKey, setShowApiKey] = useState(false)

  const [saveStatus, setSaveStatus] = useState(null)
  const [testStatus, setTestStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load persisted settings
  useEffect(() => {
    Promise.all([
      getConfig('serverUrl'),
      getConfig('apiKey'),
      getConfig('moodInterval'),
    ]).then(([url, key, iv]) => {
      if (url) setServerUrl(url)
      if (key) setApiKey(key)
      if (iv) setInterval(String(iv))
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveStatus(null)
    try {
      const iv = parseInt(interval, 10)
      if (!iv || iv < 1) {
        setSaveStatus({ type: 'error', message: 'Mood interval must be at least 1 minute.' })
        return
      }

      await Promise.all([
        setConfig('serverUrl', serverUrl.trim()),
        setConfig('apiKey', apiKey.trim()),
        setConfig('moodInterval', iv),
      ])

      // Notify background worker to update alarm
      chrome.runtime?.sendMessage?.({ action: 'updateMoodInterval', interval: iv })

      setSaveStatus({ type: 'success', message: 'Settings saved.' })
    } catch (err) {
      setSaveStatus({ type: 'error', message: `Save failed: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    if (!serverUrl.trim()) {
      setTestStatus({ type: 'error', message: 'Please enter a server URL first.' })
      return
    }
    setTesting(true)
    setTestStatus(null)
    try {
      const result = await checkConnection(serverUrl.trim())
      setTestStatus(
        result.ok
          ? { type: 'success', message: 'Connected successfully.' }
          : { type: 'error', message: `Could not connect: ${result.error}` }
      )
    } finally {
      setTesting(false)
    }
  }

  async function handleSyncNow() {
    setSyncing(true)
    setSaveStatus(null)
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime?.sendMessage?.({ action: 'syncNow' }, (r) => resolve(r))
      })
      setSaveStatus(
        response?.ok
          ? { type: 'success', message: 'Sync complete.' }
          : { type: 'info', message: 'Sync triggered. Check the extension for status.' }
      )
    } catch {
      setSaveStatus({ type: 'info', message: 'Sync triggered.' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Configure your server and mood check preferences.
        </p>
      </div>

      {/* Server connection */}
      <Card title="Server">
        <div className="space-y-4">
          <InputField
            label="Server URL"
            value={serverUrl}
            onChange={setServerUrl}
            placeholder="https://your-server.example.com"
            hint="The base URL of your mood-tracker backend."
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-••••••••••••••••"
                className="w-full px-4 py-3 pr-12 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--surface-base)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--peach-400)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The API key set in your backend environment (API_KEY).
            </p>
          </div>

          {testStatus && <StatusBadge status={testStatus} />}

          <button
            onClick={handleTest}
            disabled={testing || !serverUrl}
            className="w-full py-2.5 rounded-2xl text-sm font-medium transition-all"
            style={{
              background: testing || !serverUrl ? 'var(--border)' : 'var(--surface-base)',
              color: testing || !serverUrl ? 'var(--text-muted)' : 'var(--text-primary)',
              border: '1.5px solid var(--border)',
              cursor: testing || !serverUrl ? 'not-allowed' : 'pointer',
            }}
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
        </div>
      </Card>

      {/* Mood interval */}
      <Card title="Mood Check">
        <div className="space-y-4">
          <InputField
            label="Check interval (minutes)"
            type="number"
            value={interval}
            onChange={setInterval}
            placeholder="30"
            hint="How often the mood prompt appears. Minimum: 1 minute."
          />
        </div>
      </Card>

      {/* Data sync */}
      <Card title="Data Sync">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Data syncs automatically every 5 minutes or when 50 entries accumulate. You can also trigger it manually.
          </p>
          <button
            onClick={handleSyncNow}
            disabled={syncing || !serverUrl}
            className="w-full py-2.5 rounded-2xl text-sm font-medium transition-all"
            style={{
              background: syncing || !serverUrl ? 'var(--border)' : 'var(--peach-100)',
              color: syncing || !serverUrl ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: syncing || !serverUrl ? 'not-allowed' : 'pointer',
            }}
          >
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </Card>

      {/* Save */}
      {saveStatus && <StatusBadge status={saveStatus} />}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
        style={{
          background: saving ? 'var(--peach-100)' : 'var(--peach-300)',
          color: 'var(--text-primary)',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
