'use client';

/**
 * ProductCard
 *
 * - Square aspect-ratio image container
 * - "Quick View" overlay button fades in on hover
 * - Stock badges: In Stock (green), Pre-order (gold), Low Stock ≤3 (red), Out of Stock (grey)
 * - Price: "from ₦X" when variant prices differ
 */
'use client'

import Image              from 'next/image'
import Link               from 'next/link'
import { useState }       from 'react'
import { Eye, ShoppingBag } from 'lucide-react'

interface Variant {
  id:             string
  size:           string
  color:          string
  stock_qty:      number
  price_override: number | null
}

interface Product {
  id:               string
  name:             string
  base_price:       number
  image_url:        string | null
  stock_type:       'stock' | 'preorder' | 'both'
  is_available:     boolean
  product_variants?: Variant[]
}

function getStockBadge(product: Product) {
  const variants = product.product_variants ?? []
  const totalQty = variants.reduce((sum, v) => sum + (v.stock_qty ?? 0), 0)

  if (product.stock_type === 'preorder') {
    return { label: 'Pre-order',   color: 'var(--color-gold)',          bg: 'var(--color-gold-muted)' }
  }
  if (totalQty <= 3 && totalQty > 0) {
    return { label: 'Low Stock',   color: 'var(--color-error)',         bg: 'rgba(217,79,79,0.15)' }
  }
  if (totalQty === 0) {
    return { label: 'Out of Stock',color: 'var(--color-text-disabled)', bg: 'rgba(74,72,68,0.2)' }
  }
  return   { label: 'In Stock',    color: 'var(--color-success)',       bg: 'rgba(45,158,107,0.15)' }
}

function getDisplayPrice(product: Product): string {
  const variants = product.product_variants ?? []
  const prices   = variants.map(v => v.price_override ?? product.base_price)

  if (prices.length === 0) return `₦${product.base_price.toLocaleString()}`

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max
    ? `₦${min.toLocaleString()}`
    : `from ₦${min.toLocaleString()}`
}

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const badge        = getStockBadge(product)
  const displayPrice = getDisplayPrice(product)

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background:     'var(--glass-bg)',
          border:         '1px solid var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
          boxShadow:      hovered ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
          transform:      hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition:     'transform 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              style={{
                transform:  hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: 'var(--color-surface-2)' }}
            >
              <ShoppingBag size={40} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          )}

          {/* Quick View overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(10,10,15,0.55)',
              opacity:    hovered ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            <span
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ background: 'var(--color-gold)', color: '#0A0A0F', minHeight: '44px' }}
            >
              <Eye size={16} strokeWidth={1.5} />
              Quick View
            </span>
          </div>

          {/* Stock badge */}
          <div
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              color:      badge.color,
              background: badge.bg,
              border:     `1px solid ${badge.color}40`,
            }}
          >
            {badge.label}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-urbanist)' }}
          >
            {product.name}
          </h3>
          <p className="mt-1.5 text-base font-bold" style={{ color: 'var(--color-gold)' }}>
            {displayPrice}
          </p>
        </div>
      </div>
    </Link>
  )
}
