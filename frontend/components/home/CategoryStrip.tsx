import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryStripProps {
  categories: Category[]
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  if (!categories.length) return null

  return (
    <section
      aria-label="Shop by category"
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        {/* "All" chip */}
        <Link
          href="/products"
          className="link" // hover color handled by CSS
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            padding: '20px 24px',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRight: '1px solid var(--color-border)',
            transition: 'color var(--duration-fast) var(--ease-smooth), background var(--duration-fast)',
            flexShrink: 0,
          }}
        >
          All
        </Link>

        {categories.map((cat, idx) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="link" // hover color handled by CSS
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              padding: '20px 24px',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRight: idx < categories.length - 1 ? '1px solid var(--color-border)' : 'none',
              transition: 'color var(--duration-fast) var(--ease-smooth), background var(--duration-fast)',
              flexShrink: 0,
            }}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  )
}