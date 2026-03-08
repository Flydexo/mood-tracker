import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatDuration } from '../../lib/utils.js'
import { colors } from '../../lib/theme.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: 'white', border: '1px solid var(--border)', minWidth: 180 }}
    >
      <div className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{p.name}:</span>
          <span className="font-medium" style={{ color: 'var(--text-primary)', fontSize: 11 }}>
            {formatDuration(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function UsageChart({ data = [], onDomainClick }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">🌐</div>
          <p className="text-sm">No website data yet</p>
        </div>
      </div>
    )
  }

  const chartData = data.slice(0, 10).map((d) => ({
    domain: d.domain,
    Active: d.totalActive,
    Media: d.totalMedia,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            tickFormatter={(v) => formatDuration(v)}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="domain"
            width={120}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--peach-50)' }} />
          <Bar
            dataKey="Active"
            stackId="a"
            fill={colors.peach[300]}
            radius={[0, 0, 0, 0]}
            isAnimationActive
            animationDuration={600}
            cursor="pointer"
            onClick={(d) => onDomainClick?.(d.domain)}
          />
          <Bar
            dataKey="Media"
            stackId="a"
            fill={colors.lavender}
            radius={[4, 4, 4, 4]}
            isAnimationActive
            animationDuration={700}
            cursor="pointer"
            onClick={(d) => onDomainClick?.(d.domain)}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-end">
        {[
          { label: 'Active', color: colors.peach[300] },
          { label: 'Media', color: colors.lavender },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="w-3 h-3 rounded" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
