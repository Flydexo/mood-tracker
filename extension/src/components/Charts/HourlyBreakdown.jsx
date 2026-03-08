import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatDuration } from '../../lib/utils.js'
import { colors, moodColors } from '../../lib/theme.js'

function formatHour(h) {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: 'white', border: '1px solid var(--border)', minWidth: 160 }}
    >
      <div className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {formatHour(label)}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{p.name}:</span>
          <span className="font-medium" style={{ color: 'var(--text-primary)', fontSize: 11 }}>
            {p.name === 'Mood' ? p.value?.toFixed(1) : formatDuration(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function HourlyBreakdown({ hourlyActive = {}, hourlyMedia = {}, hourlyMood = {}, title = 'By Hour of Day' }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const data = hours.map((h) => ({
    hour: h,
    Active: hourlyActive[h] || 0,
    Media: hourlyMedia[h] || 0,
    Mood: hourlyMood[h] || null,
  }))

  const hasData = data.some((d) => d.Active > 0 || d.Media > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">⏰</div>
          <p className="text-sm">No hourly data yet</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          dataKey="hour"
          tickFormatter={formatHour}
          interval={2}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatDuration(v)}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--peach-50)' }} />
        <Bar
          dataKey="Active"
          stackId="a"
          fill={colors.peach[300]}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="Media"
          stackId="a"
          fill={colors.lavender}
          radius={[3, 3, 0, 0]}
          isAnimationActive
          animationDuration={800}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
