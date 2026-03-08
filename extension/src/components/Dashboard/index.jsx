import { useState } from 'react'
import { useStats, useDomainStats } from '../../hooks/useStats.js'
import { getDateRange, formatDuration } from '../../lib/utils.js'
import { moodColors, moodLabels, moodEmojis } from '../../lib/theme.js'
import PeriodSelector from '../ui/PeriodSelector.jsx'
import Card from '../ui/Card.jsx'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'
import MoodChart from '../Charts/MoodChart.jsx'
import UsageChart from '../Charts/UsageChart.jsx'
import HourlyBreakdown from '../Charts/HourlyBreakdown.jsx'

// ─── Domain Detail Modal ──────────────────────────────────────────────────────

function DomainModal({ domain, from, to, onClose }) {
  const { data, loading } = useDomainStats(domain, from, to)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(61,43,31,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-8 shadow-2xl"
        style={{ background: 'var(--surface-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {domain}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Hourly breakdown
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors hover:bg-opacity-80"
            style={{ background: 'var(--peach-100)', color: 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : data ? (
          <>
            {/* Stat pills */}
            <div className="flex gap-4 mb-6">
              {[
                { label: 'Active', value: formatDuration(data.totalActive || 0), color: 'var(--peach-300)' },
                { label: 'Media', value: formatDuration(data.totalMedia || 0), color: 'var(--lavender)' },
                { label: 'Visits', value: data.visitCount || 0, color: 'var(--mint)' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-2xl px-4 py-3 text-center"
                  style={{ background: s.color, opacity: 0.9 }}
                >
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {s.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <HourlyBreakdown
              hourlyActive={data.hourlyActive || {}}
              hourlyMedia={data.hourlyMedia || {}}
              hourlyMood={data.hourlyMood || {}}
              title={`${domain} by hour`}
            />
          </>
        ) : (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No data available for this domain.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Avg Mood Badge ───────────────────────────────────────────────────────────

function MoodBadge({ avg }) {
  if (!avg) return null
  const idx = Math.round(avg) - 1
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium"
      style={{ background: moodColors[idx] + '30', color: 'var(--text-primary)' }}
    >
      <span className="text-lg">{moodEmojis[idx]}</span>
      <span>
        Avg mood: <strong>{avg.toFixed(1)}</strong> — {moodLabels[idx]}
      </span>
    </div>
  )
}

// ─── No Server State ──────────────────────────────────────────────────────────

function NoServerState({ onGoSettings }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🌸</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Connect to your server
      </h2>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Add your server URL and API key in Settings to start seeing your mood and usage stats.
      </p>
      <button
        onClick={onGoSettings}
        className="px-6 py-2.5 rounded-2xl text-sm font-medium transition-all"
        style={{ background: 'var(--peach-200)', color: 'var(--text-primary)' }}
      >
        Open Settings
      </button>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onNavigate }) {
  const [period, setPeriod] = useState('daily')
  const [selectedDomain, setSelectedDomain] = useState(null)

  const { from, to } = getDateRange(period)
  const { summary, hourly, loading, error, hasServer } = useStats(from, to, period)

  if (!hasServer) {
    return <NoServerState onGoSettings={() => onNavigate?.('settings')} />
  }

  const moodData = summary?.moods || []
  const topDomains = summary?.topDomains || []
  const avgMood = summary?.avgMood || null

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {period === 'daily'
              ? 'Today'
              : period === 'weekly'
              ? 'Last 7 days'
              : period === 'monthly'
              ? 'Last 30 days'
              : 'Last year'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {avgMood && <MoodBadge avg={avgMood} />}
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{ background: '#FFE0E0', color: '#8B3A3A' }}
        >
          Could not load data: {error}
        </div>
      )}

      {/* Mood chart */}
      <Card title="Mood over time" loading={loading}>
        <MoodChart data={moodData} />
      </Card>

      {/* Summary stats row */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Mood entries',
              value: summary.moodCount ?? moodData.length,
              icon: '🧠',
              color: 'var(--peach-100)',
            },
            {
              label: 'Active browsing',
              value: formatDuration(summary.totalActive || 0),
              icon: '🖥️',
              color: 'var(--mint)',
            },
            {
              label: 'Media time',
              value: formatDuration(summary.totalMedia || 0),
              icon: '🎬',
              color: 'var(--lavender)',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl p-5 flex flex-col gap-1"
              style={{ background: s.color }}
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage chart */}
      <Card title="Top websites" loading={loading}>
        <UsageChart data={topDomains} onDomainClick={setSelectedDomain} />
        {topDomains.length > 0 && (
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
            Click a bar to see hourly breakdown
          </p>
        )}
      </Card>

      {/* Hourly breakdown (global) */}
      <Card title="Activity by hour of day" loading={loading}>
        <HourlyBreakdown
          hourlyActive={hourly?.active || {}}
          hourlyMedia={hourly?.media || {}}
          hourlyMood={hourly?.mood || {}}
        />
      </Card>

      {/* Domain detail modal */}
      {selectedDomain && (
        <DomainModal
          domain={selectedDomain}
          from={from}
          to={to}
          onClose={() => setSelectedDomain(null)}
        />
      )}
    </div>
  )
}
