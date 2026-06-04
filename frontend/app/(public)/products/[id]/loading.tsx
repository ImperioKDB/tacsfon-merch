/**
 * Suspense skeleton for the product detail page.
 * Mirrors the two-column layout so there is no layout shift on load.
 */
export default function ProductDetailLoading() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">

        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center gap-2">
          {[80, 16, 60, 16, 140].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded"
              style={{ background: 'var(--bg-elevated)', width: `${w}px`, flexShrink: 0 }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          {/* Viewer skeleton */}
          <div className="w-full lg:w-[480px] lg:flex-shrink-0">
            <div
              className="aspect-square w-full animate-pulse rounded-2xl"
              style={{ background: 'var(--bg-elevated)' }}
            />
            {/* Tab skeletons */}
            <div className="mt-4 flex gap-2">
              {[1, 2].map(i => (
                <div
                  key={i}
                  className="h-10 w-24 animate-pulse rounded-xl"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="flex-1 space-y-5">
            <div className="h-8 w-3/4 animate-pulse rounded-lg" style={{ background: 'var(--bg-elevated)' }} />
            <div className="h-6 w-1/4 animate-pulse rounded-md"  style={{ background: 'var(--bg-elevated)' }} />
            <div className="h-4 w-1/3 animate-pulse rounded-md"  style={{ background: 'var(--bg-elevated)' }} />
            <div className="space-y-2 pt-2">
              {[100, 90, 95, 70].map((w, i) => (
                <div key={i} className="h-4 animate-pulse rounded" style={{ background: 'var(--bg-elevated)', width: `${w}%` }} />
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {['S', 'M', 'L', 'XL'].map(s => (
                <div key={s} className="h-10 w-12 animate-pulse rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
              ))}
            </div>
            <div className="h-14 w-full animate-pulse rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
