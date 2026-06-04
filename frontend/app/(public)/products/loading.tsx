/**
 * Suspense loading state for /products
 * Shows a skeleton sidebar + grid while the page shell streams in.
 */
import ProductsSkeleton from '@/components/products/ProductsSkeleton'

export default function ProductsLoading() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Header skeleton */}
      <div
        className="border-b px-4 py-8 md:px-8"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="mx-auto max-w-7xl space-y-3">
          <div
            className="h-9 w-48 animate-pulse rounded-lg"
            style={{ background: 'var(--bg-elevated)' }}
          />
          <div
            className="h-5 w-72 animate-pulse rounded-md"
            style={{ background: 'var(--bg-elevated)' }}
          />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 md:px-8">

        {/* Sidebar skeleton */}
        <aside className="hidden w-64 flex-shrink-0 space-y-4 lg:block">
          {[80, 60, 70, 55, 65].map((w, i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded-md"
              style={{ background: 'var(--bg-elevated)', width: `${w}%` }}
            />
          ))}
        </aside>

        {/* Grid skeleton */}
        <main className="min-w-0 flex-1">
          <ProductsSkeleton />
        </main>
      </div>
    </div>
  )
}
