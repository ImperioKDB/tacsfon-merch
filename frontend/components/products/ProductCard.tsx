'use client'

import Image from 'next/image'
import Link  from 'next/link'
import { ShoppingBag } from 'lucide-react'

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
  if (product.stock_type === 'preorder') return { label: 'Pre-order', color: 'var(--accent)',     bg: 'rgba(201,168,76,0.12)' }
  if (totalQty <= 3 && totalQty > 0)    return { label: 'Low Stock', color: 'var(--danger)',     bg: 'rgba(224,82,82,0.12)' }
  if (totalQty === 0)                   return { label: 'Sold Out',  color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)' }
  return null
}

function getDisplayPrice(product: Product): string {
  const variants = product.product_variants ?? []
  const prices   = variants.map((v) => v.price_override ?? product.base_price)
  if (!prices.length) return `₦${product.base_price.toLocaleString()}`
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `₦${min.toLocaleString()}` : `from ₦${min.toLocaleString()}`
}

export default function ProductCard({ product }: { product: Product }) {
  const badge        = getStockBadge(product)
  const displayPrice = getDisplayPrice(product)

  return (
    <Link
      href={`/products/${product.id}`}
      className="product-card"
      style={{ display: 'block', textDecoration: 'none' }}
      aria-label={`${product.name} — ${displayPrice}`}
    >
      {/* Image container */}
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card__image"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={32} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="product-card__overlay" aria-hidden="true" />

        {/* Hover reveal panel */}
        <div className="product-card__info" style={{ pointerEvents: 'none' }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              letterSpacing: '0.04em',
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '4px',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            {product.name}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {displayPrice}
          </p>
        </div>

        {/* Stock badge */}
        {badge && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: badge.color,
              background: badge.bg,
              padding: '4px 10px',
              border: `1px solid ${badge.color}40`,
            }}
          >
            {badge.label}
          </div>
        )}
      </div>

      {/* Below-image info row */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--accent)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {displayPrice}
        </p>
      </div>
    </Link>
  )
}
