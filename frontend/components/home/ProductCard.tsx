'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, resolveImageUrl } from '@/lib/utils/formatters'
import { useCartStore } from '@/store/cart'
import { apiFetch } from '@/lib/api/fetch'
import type { Product } from '@/types'

interface HomeProductCardProps {
  product:  Product
  priority?: boolean
}

export default function HomeProductCard({ product, priority = false }: HomeProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const incrementCart = useCartStore((s) => s.increment)

  const variants     = product.variants || (product as any).product_variants || []
  const firstVariant = variants[0]
  const displayPrice = formatPrice(firstVariant?.price_override ?? product.base_price)
  const img          = resolveImageUrl(product.image_url)

  // Stock badge
  const totalQty = variants.reduce((sum: number, v: any) => sum + (v.stock_qty ?? 0), 0)
  const badge =
    product.stock_type === 'preorder'
      ? { label: 'Pre-order', color: 'var(--accent)',   bg: 'rgba(201,168,76,0.12)' }
      : totalQty <= 3 && totalQty > 0
      ? { label: 'Low Stock', color: 'var(--danger)',   bg: 'rgba(224,82,82,0.12)' }
      : totalQty === 0
      ? { label: 'Sold Out',  color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)' }
      : null

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!firstVariant) return toast.error('Please select a variant on the product page')
    setIsAdding(true)
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variant_id: firstVariant.id, quantity: 1 }),
      })
      incrementCart(1)
      toast.success(`${product.name} added to cart`)
    } catch (err: any) {
      toast.error(err.message || 'Sign in to add items to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="product-card">
      <Link
        href={`/products/${product.id}`}
        style={{ display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}
        aria-label={`View ${product.name} — ${displayPrice}`}
        tabIndex={0}
      >
        {/* Image */}
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            priority={priority}
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
            <ShoppingCart size={32} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="product-card__overlay" aria-hidden="true" />

        {/* Hover info panel */}
        <div className="product-card__info">
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              letterSpacing: '0.04em',
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '4px',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {product.name}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: '12px',
            }}
          >
            {displayPrice}
          </p>
          {/* Quick Add */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || totalQty === 0}
            aria-label={`Quick add ${product.name} to cart`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#000',
              background: isAdding ? 'var(--accent-hover)' : 'var(--accent)',
              border: 'none',
              padding: '10px 18px',
              cursor: isAdding || totalQty === 0 ? 'not-allowed' : 'pointer',
              opacity: totalQty === 0 ? 0.5 : 1,
              transition: 'background 150ms ease',
              minHeight: '40px',
            }}
          >
            {isAdding
              ? <Loader2 size={12} className="animate-spin" />
              : <ShoppingCart size={12} strokeWidth={2} />
            }
            {isAdding ? 'Adding…' : 'Quick Add'}
          </button>
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
      </Link>

      {/* Below-image info — visible on mobile (no hover) */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            maxWidth: '60%',
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
          }}
        >
          {displayPrice}
        </p>
      </div>
    </div>
  )
}
