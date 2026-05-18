/**
 * ProductsSkeleton
 *
 * Shimmer grid of placeholder cards.
 * Used by loading.tsx (full page) and ProductsGrid (partial / load-more).
 */
export default function ProductsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'var(--color-surface)',
            border:     '1px solid var(--color-border)',
          }}
        >
          <div
            className="aspect-square w-full animate-pulse"
            style={{ background: 'var(--color-surface-2)' }}
          />
          <div className="space-y-2.5 p-4">
            <div className="h-4 animate-pulse rounded" style={{ background: 'var(--color-surface-2)', width: '75%' }} />
            <div className="h-4 animate-pulse rounded" style={{ background: 'var(--color-surface-2)', width: '55%' }} />
            <div className="mt-3 h-5 animate-pulse rounded" style={{ background: 'var(--color-surface-2)', width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
