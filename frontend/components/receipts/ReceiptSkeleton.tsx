export default function ReceiptSkeleton() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      {/* Header skeleton */}
      <div className="px-8 py-7" style={{ background: '#0A0A0F', borderBottom: '3px solid #C9A84C' }}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded animate-pulse" style={{ background: '#1C1C26' }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: '#1C1C26' }} />
          </div>
          <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: '#1C1C26' }} />
        </div>
      </div>

      {/* Meta skeleton */}
      <div
        className="px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}
      >
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-16 rounded animate-pulse bg-gray-200" />
            <div className="h-4 w-24 rounded animate-pulse bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="px-8 py-6 space-y-4">
        {/* Header row */}
        <div className="flex justify-between pb-3" style={{ borderBottom: '2px solid #E5E7EB' }}>
          {[60, 20, 20, 20].map((w, i) => (
            <div key={i} className={`h-2.5 rounded animate-pulse bg-gray-200`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Item rows */}
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <div className="space-y-1.5" style={{ width: '55%' }}>
              <div className="h-3.5 rounded animate-pulse bg-gray-300" style={{ width: '80%' }} />
              <div className="h-2.5 rounded animate-pulse bg-gray-200" style={{ width: '50%' }} />
            </div>
            {[1, 2, 3].map(j => (
              <div key={j} className="h-3.5 w-12 rounded animate-pulse bg-gray-200" />
            ))}
          </div>
        ))}
        {/* Totals skeleton */}
        <div className="pt-4 space-y-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          {[1, 2].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-16 rounded animate-pulse bg-gray-200" />
              <div className="h-3 w-20 rounded animate-pulse bg-gray-200" />
            </div>
          ))}
          <div className="flex justify-between pt-2" style={{ borderTop: '2px solid #C9A84C' }}>
            <div className="h-4 w-10 rounded animate-pulse bg-gray-300" />
            <div className="h-4 w-24 rounded animate-pulse" style={{ background: '#E8C96A' }} />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div
        className="px-8 py-5 flex flex-col items-center gap-2"
        style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}
      >
        <div className="h-3.5 w-56 rounded animate-pulse bg-gray-200" />
        <div className="h-2.5 w-44 rounded animate-pulse bg-gray-200" />
      </div>
    </div>
  );
}