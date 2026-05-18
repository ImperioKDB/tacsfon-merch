import Link from 'next/link'
import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section
      aria-labelledby="featured-heading"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px',
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '48px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.625rem',
              fontWeight: 500,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              marginBottom: '8px',
            }}
          >
            Just Dropped
          </span>
          <h2
            id="featured-heading"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              letterSpacing: '0.02em',
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}
          >
            New Arrivals
          </h2>
        </div>

        <Link
          href="/products"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color var(--duration-fast)',
            paddingBottom: '4px',
            borderBottom: '1px solid var(--color-gold)',
          }}
        >
          View All
        </Link>
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.9375rem',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            padding: '60px 0',
          }}
        >
          No products available yet. Check back soon.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1px', // tight grid lines (no gap, just border)
            background: 'var(--color-border)', // grid line color
          }}
        >
          {products.map((product, i) => (
            <div key={product.id} style={{ background: 'var(--color-bg)' }}>
              <ProductCard product={product} priority={i < 2} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}