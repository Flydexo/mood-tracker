import { useState, useEffect } from 'react'
import Dashboard from '../components/Dashboard/index.jsx'
import Settings from '../components/Settings.jsx'
import MoodPrompt from '../components/MoodPrompt.jsx'
import { getConfig } from '../lib/db.js'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [showMoodPrompt, setShowMoodPrompt] = useState(false)

  // Listen for mood prompt trigger from service worker
  useEffect(() => {
    const handler = (msg) => {
      if (msg?.action === 'showMoodPrompt') {
        setShowMoodPrompt(true)
      }
    }
    chrome.runtime?.onMessage?.addListener(handler)
    return () => chrome.runtime?.onMessage?.removeListener(handler)
  }, [])

  // Check if server is configured on first load
  useEffect(() => {
    getConfig('serverUrl').then((url) => {
      if (!url) setPage('settings')
    })
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-base)' }}>
      {/* Navigation */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b"
        style={{
          background: 'rgba(255,250,247,0.9)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--peach-300)', color: 'var(--text-primary)' }}
          >
            M
          </div>
          <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Mood Tracker
          </span>
        </div>

        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: page === item.id ? 'var(--peach-200)' : 'transparent',
                color: page === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'settings' && <Settings />}
      </main>

      {/* Mood prompt overlay — non-dismissible */}
      {showMoodPrompt && (
        <MoodPrompt onComplete={() => setShowMoodPrompt(false)} />
      )}
    </div>
  )
}
