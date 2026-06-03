export default function ProductsSkeleton() {
  return (
    <div>
      {/* Count placeholder */}
      <div
        style={{
          width: '80px',
          height: '12px',
          background: 'var(--bg-elevated)',
          marginBottom: '24px',
          borderRadius: '2px',
        }}
      />

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1px',
          background: 'var(--border)',
        }}
        className="products-grid"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-base)',
              aspectRatio: '3/4',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-surface) 50%, var(--bg-elevated) 100%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.4s infinite linear',
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
