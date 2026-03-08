const PERIODS = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: '7 Days' },
  { id: 'monthly', label: '30 Days' },
  { id: 'yearly', label: 'Year' },
]

export default function PeriodSelector({ value, onChange }) {
  return (
    <div
      className="flex gap-1 p-1 rounded-2xl"
      style={{ background: 'var(--peach-100)' }}
    >
      {PERIODS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{
            background: value === p.id ? 'white' : 'transparent',
            color: value === p.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: value === p.id ? '0 1px 4px rgba(61,43,31,0.1)' : 'none',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
