import { useState } from 'react'
import { generateUUID } from '../lib/utils.js'
import { moodColors, moodLabels, moodEmojis } from '../lib/theme.js'

const MOODS = [1, 2, 3, 4, 5, 6, 7]

export default function MoodPrompt({ onComplete }) {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSelect(mood) {
    setSelected(mood)
    setSaving(true)

    const log = {
      clientId: generateUUID(),
      mood,
      timestamp: new Date().toISOString(),
      synced: false,
    }

    try {
      // Send to service worker to persist + sync
      await chrome.runtime.sendMessage({ action: 'saveMoodLog', data: log })
    } catch {
      // Extension context may not be available (e.g. dev mode) — still close
    }

    setSaving(false)
    onComplete()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(61,43,31,0.35)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-3xl p-10 shadow-2xl"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌸</div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            How are you feeling?
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Take a moment to check in with yourself.
          </p>
        </div>

        {/* Mood buttons */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {MOODS.map((mood) => {
            const color = moodColors[mood - 1]
            const label = moodLabels[mood - 1]
            const emoji = moodEmojis[mood - 1]
            const isSelected = selected === mood

            return (
              <button
                key={mood}
                onClick={() => !saving && handleSelect(mood)}
                disabled={saving}
                title={label}
                className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl transition-all duration-150 group"
                style={{
                  background: isSelected ? color : `${color}30`,
                  border: `2px solid ${isSelected ? color : 'transparent'}`,
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  cursor: saving ? 'wait' : 'pointer',
                }}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span
                  className="text-[9px] font-medium leading-tight text-center"
                  style={{ color: isSelected ? '#3D2B1F' : 'var(--text-muted)' }}
                >
                  {label.split(' ').slice(-1)[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Full labels */}
        <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          {selected ? (
            <span
              className="font-medium text-sm"
              style={{ color: moodColors[selected - 1] }}
            >
              {moodEmojis[selected - 1]} {moodLabels[selected - 1]}
            </span>
          ) : (
            'Select your current mood to continue'
          )}
        </div>
      </div>
    </div>
  )
}
