'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/formatters'
import Badge from '@/components/ui/Badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

// ── Derive display data from product + variants ────────────────────────────

function getPriceDisplay(product: Product): string {
  const variants = product.variants ?? []
  if (!variants.length) return formatPrice(product.base_price)

  const prices = variants.map((v) => v.price_override ?? product.base_price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return min === max ? formatPrice(min) : `From ${formatPrice(min)}`
}

function getStockBadge(product: Product): { label: string; variant: 'success' | 'error' | 'gold' | 'default' } | null {
  const variants = product.variants ?? []
  const totalStock = variants.reduce((sum, v) => sum + v.stock_qty, 0)

  if (product.stock_type === 'preorder') return { label: 'Pre-order', variant: 'gold' }
  if (totalStock === 0)                  return { label: 'Out of Stock', variant: 'error' }
  if (totalStock <= 3)                   return { label: 'Low Stock', variant: 'error' }
  return { label: 'In Stock', variant: 'success' }
}

function getUniqueColors(product: Product): string[] {
  const seen = new Set<string>()
  ;(product.variants ?? []).forEach((v) => {
    if (v.color) seen.add(v.color)
  })
  return Array.from(seen).slice(0, 5) // show max 5 dots
}

// ── Color swatch dot ───────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  White:  '#F7F5F0',
  Black:  '#1A1A1A',
  Red:    '#C0392B',
  Yellow: '#F1C40F',
  Navy:   '#1A237E',
  Grey:   '#9E9E9E',
  Green:  '#2E7D32',
  Blue:   '#1565C0',
}

function ColorDot({ color }: { color: string }) {
  const hex = COLOR_MAP[color] ?? '#888'
  return (
    <span
      title={color}
      style={{
        width: '10px',
        height: '10px',
        background: hex,
        display: 'inline-block',
        border: '1px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}
    />
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)

  const priceDisplay = getPriceDisplay(product)
  const stockBadge   = getStockBadge(product)
  const colors       = getUniqueColors(product)
  const imageUrl     = product.image_url

  return (
    <article
      style={{ display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image container ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1',
          overflow: 'hidden',
          background: 'var(--color-surface)',
          transition: 'box-shadow var(--duration-base) var(--ease-smooth)',
          boxShadow: hovered ? 'var(--shadow-gold)' : 'none',
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            style={{
              objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.4s var(--ease-smooth)',
            }}
          />
        ) : (
          // No image placeholder
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-surface-2)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.625rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-disabled)',
              }}
            >
              No Image
            </span>
          </div>
        )}

        {/* Quick View overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,10,15,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity var(--duration-base) var(--ease-smooth)',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
        >
          <Link
            href={`/products/${product.id}`}
            tabIndex={hovered ? 0 : -1}
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#0A0A0F',
              background: 'var(--color-gold)',
              border: 'none',
              padding: '12px 28px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background var(--duration-fast)',
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition2: 'transform 0.3s var(--ease-smooth)',
            } as React.CSSProperties}
          >
            View Product
          </Link>
        </div>

        {/* Stock badge — top left */}
        {stockBadge && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1 }}>
            <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
          </div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          background: 'var(--color-bg)',
          borderTop: hovered ? '1px solid var(--color-gold)' : '1px solid transparent',
          transition: 'border-color var(--duration-base)',
        }}
      >
        {/* Product name */}
        <Link
          href={`/products/${product.id}`}
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 600,
            fontSize: '1.0625rem',
            letterSpacing: '0.02em',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {product.name}
        </Link>

        {/* Price */}
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--color-gold)',
            letterSpacing: '0.02em',
          }}
        >
          {priceDisplay}
        </span>

        {/* Color swatch dots */}
        {colors.length > 0 && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}
            aria-label={`Available colors: ${colors.join(', ')}`}
          >
            {colors.map((color) => (
              <ColorDot key={color} color={color} />
            ))}
            {(product.variants ?? []).filter((v) => v.color).length > 5 && (
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.5625rem',
                  color: 'var(--color-text-disabled)',
                  letterSpacing: '0.08em',
                }}
              >
                +{(product.variants ?? []).filter((v) => v.color).length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}