import LoadingSpinner from './LoadingSpinner.jsx'

export default function Card({ title, subtitle, children, className = '', action, loading = false }) {
  return (
    <div
      className={`rounded-3xl p-6 ${className}`}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 16px rgba(61,43,31,0.04)',
      }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {loading ? <LoadingSpinner /> : children}
    </div>
  )
}
