export default function LoadingSpinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className="rounded-full border-2 animate-spin"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--peach-200)',
          borderTopColor: 'var(--peach-500)',
        }}
      />
    </div>
  )
}
