interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

/**
 * Shimmer skeleton placeholder for loading states.
 * Use instead of spinners for content areas (per design spec).
 */
export default function Skeleton({ width, height, className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      role="presentation"
    />
  )
}

/** Convenience: row of skeletons for a product card grid */
export function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton height={280} style={{ width: '100%' }} />
      <Skeleton height={18} style={{ width: '70%' }} />
      <Skeleton height={14} style={{ width: '40%' }} />
      <Skeleton height={10} style={{ width: '50%' }} />
    </div>
  )
}