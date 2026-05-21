'use client';

/**
 * ProductInfo (Client Component)
 *
 * Right panel of the product detail page.
 *
 * Features:
 * - Product name, price (variant-aware), stock type badge
 * - Description with "Read more / Show less" collapse toggle
 * - VariantSelector — size + color chips
 * - Stock count warning: "Only X left!" when qty <= 5
 * - QuantitySelector: clamps to selected variant stock
 * - Add to Cart button (56px tall, full width, gold)
 *   → calls POST /api/cart/items
 *   → increments Zustand cart count on success
 *   → shows toast on success/error
 *
 * 3D integration:
 * - Writes selectedVariant.color to useSelectedProductStore on every variant change
 * - ProductViewer reads this store to update the procedural 3D viewer colour reactively
 */
'use client'

import { useState, useMemo, useEffect } from 'react'
import { ShoppingCart }                  from 'lucide-react'
import { toast }                         from 'sonner'
import type { Product, ProductVariant }  from '@/types'
import { apiFetch }                      from '@/lib/api/fetch'
import { useCartStore }                  from '@/store/cart'
import { useSelectedProductStore }       from '@/store/selected-product'
import VariantSelector                   from './VariantSelector'
import QuantitySelector                  from './QuantitySelector'

const ERROR_MESSAGES: Record<string, string> = {
  CART_EMPTY:          "Your cart is empty. Add some items first!",
  INSUFFICIENT_STOCK:  "Sorry, not enough stock for your requested quantity.",
  PRODUCT_UNAVAILABLE: "This product is no longer available.",
  UNAUTHORIZED:        "Please log in to add items to your cart.",
  FILE_TOO_LARGE:      "File is too large. Please upload a file under 5MB.",
  NETWORK_ERROR:       "Connection issue. Please check your internet and try again.",
}

function mapError(code: string): string {
  return ERROR_MESSAGES[code] ?? "Something went wrong. Please try again."
}

interface Props { product: Product }

export default function ProductInfo({ product }: Props) {
  // Derive variants and memoize them so they are visible to the whole component
  const variants = useMemo(
    () => product.variants ?? (product as any).product_variants ?? [],
    [product]
  );

  // Pre-select first in-stock variant, or first variant if all out of stock
  const defaultVariant = useMemo(
    () => variants.find((v: ProductVariant) => v.stock_qty > 0) ?? variants[0] ?? null,
    [variants]
  );

  const [selected,  setSelected]  = useState<ProductVariant | null>(defaultVariant)
  const [quantity,  setQuantity]  = useState(1)
  const [expanded,  setExpanded]  = useState(false)
  const [adding,    setAdding]    = useState(false)

  const increment        = useCartStore(s => s.increment)
  const setVariantColor  = useSelectedProductStore(s => s.setVariantColor)
  const resetProductStore = useSelectedProductStore(s => s.reset)

  // Seed the 3D viewer with the default variant's colour on mount
  useEffect(() => {
    setVariantColor(defaultVariant?.color ?? null)
    // Reset when leaving the page
    return () => resetProductStore()
  }, [defaultVariant, setVariantColor, resetProductStore])

  // Price — variant override takes precedence
  const price    = selected?.price_override ?? product.base_price
  const stockQty = selected?.stock_qty ?? 0
  const lowStock = stockQty > 0 && stockQty <= 5

  // Clamp quantity when variant changes + update 3D viewer colour
  function handleVariantChange(v: ProductVariant) {
    setSelected(v)
    setQuantity(q => Math.min(q, v.stock_qty || 1))
    setVariantColor(v.color ?? null)   // ← drives the 3D viewer reactively
  }

  async function handleAddToCart() {
    if (!selected) {
      toast.error('Please select a variant.')
      return
    }
    if (stockQty === 0) {
      toast.error('This variant is out of stock.')
      return
    }

    setAdding(true)
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body:   JSON.stringify({ variant_id: selected.id, quantity }),
      })
      increment(quantity)
      toast.success(`Added ${quantity} × ${product.name} to your cart!`)
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
        }
      } else {
        toast.error(mapError(code))
      }
    } finally {
      setAdding(false)
    }
  }

  // Stock type badge
  const stockBadge = (() => {
    if (product.stock_type === 'preorder') return { label: 'Pre-order',    color: 'var(--color-gold)',    bg: 'var(--color-gold-muted)' }
    if (stockQty === 0)                    return { label: 'Out of Stock', color: 'var(--color-error)',   bg: 'rgba(217,79,79,0.12)' }
    return                                        { label: 'In Stock',     color: 'var(--color-success)', bg: 'rgba(45,158,107,0.12)' }
  })()

  const description = product.description ?? ''
  const isLong      = description.split('\n').filter(Boolean).length > 3 || description.length > 200

  return (
    <div className="space-y-6">

      {/* Name */}
      <h1
        className="text-3xl font-bold leading-tight md:text-4xl"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-urbanist)' }}
      >
        {product.name}
      </h1>

      {/* Price + Stock badge */}
      <div className="flex items-center gap-4">
        <span
          className="text-3xl font-bold"
          style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-urbanist)' }}
        >
          ₦{price.toLocaleString()}
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            color:       stockBadge.color,
            background:  stockBadge.bg,
            border:      `1px solid ${stockBadge.color}40`,
          }}
        >
          {stockBadge.label}
        </span>
      </div>

      {/* Description */}
      {description.length > 0 && (
        <div>
          <p
            className="text-sm leading-relaxed"
            style={{
              color:             'var(--color-text-secondary)',
              overflow:          'hidden',
              display:           '-webkit-box',
              WebkitLineClamp:   expanded ? 'unset' : 3,
              WebkitBoxOrient:   'vertical',
            } as React.CSSProperties}
          >
            {description}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-1.5 text-xs font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Variants */}
      {variants.length > 0 && (
        <VariantSelector
          variants={variants}
          selectedId={selected?.id ?? null}
          onSelect={handleVariantChange}
        />
      )}

      {/* Low stock warning */}
      {lowStock && (
        <p className="text-sm font-semibold" style={{ color: 'var(--color-error)' }}>
          Only {stockQty} left — order soon!
        </p>
      )}

      {/* Quantity + Add to Cart */}
      <div className="space-y-4 pt-1">
        {stockQty > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Qty</span>
            <QuantitySelector
              value={quantity}
              maxQty={stockQty}
              onChange={setQuantity}
            />
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={adding || stockQty === 0}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: 'var(--color-gold)',
            color:      '#0A0A0F',
            minHeight:  '56px',
            boxShadow:  adding ? 'none' : 'var(--shadow-gold)',
          }}
        >
          {adding ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Adding…
            </>
          ) : (
            <>
              <ShoppingCart size={18} strokeWidth={1.5} />
              {stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}