'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Category } from '@/types'

interface CategoryStripProps {
  categories: Category[]
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  if (!categories.length) return null

  const searchParams   = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'all'

  const all = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <section aria-label="Shop by category">
      {/* Gold top rule */}
      <div
        aria-hidden="true"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)',
        }}
      />

      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch' as any,
            gap: '0',
          }}
        >
          {all.map((cat, idx) => {
            const isActive = cat.id === activeCategory
            const href = cat.id === 'all' ? '/products' : `/products?category=${cat.id}`

            return (
              <Link
                key={cat.id}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  padding: '18px 24px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  borderRight: idx < all.length - 1 ? '1px solid var(--border)' : 'none',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'color 150ms ease, border-color 150ms ease',
                  position: 'relative',
                }}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
