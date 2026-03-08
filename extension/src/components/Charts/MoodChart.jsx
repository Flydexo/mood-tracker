import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { moodColors, moodLabels, moodEmojis } from '../../lib/theme.js'
import { formatDate } from '../../lib/utils.js'

const MOOD_TICKS = [1, 2, 3, 4, 5, 6, 7]

function CustomDot({ cx, cy, payload }) {
  if (!payload || !payload.mood) return null
  const color = moodColors[payload.mood - 1]
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.9} />
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.15} />
    </g>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: 'white', border: '1px solid var(--border)', minWidth: 160 }}
    >
      <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        {moodEmojis[(d.mood || 1) - 1]} {moodLabels[(d.mood || 1) - 1]}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{formatDate(d.timestamp)}</div>
    </div>
  )
}

export default function MoodChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">🌸</div>
          <p className="text-sm">No mood data yet</p>
        </div>
      </div>
    )
  }

  // Convert timestamps to sortable numeric X values
  const plotData = data
    .map((d) => ({ ...d, x: new Date(d.timestamp).getTime() }))
    .sort((a, b) => a.x - b.x)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={plotData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0.5, 7.5]}
          ticks={MOOD_TICKS}
          tickFormatter={(v) => moodEmojis[v - 1] || ''}
          tick={{ fontSize: 14 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={4} stroke="var(--border)" strokeDasharray="4 4" />
        {/* Interpolated trend line */}
        <Line
          type="monotone"
          dataKey="mood"
          stroke="var(--peach-400)"
          strokeWidth={2}
          dot={false}
          activeDot={false}
          connectNulls
          opacity={0.6}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
        {/* Real data scatter points */}
        <Scatter
          dataKey="mood"
          shape={<CustomDot />}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
