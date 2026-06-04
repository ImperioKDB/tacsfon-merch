'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ShoppingBag, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore }    from '@/store/cart'
import { apiFetch }       from '@/lib/api/fetch'
import StickyATC           from '@/components/product/StickyATC'
import VariantSelector     from './VariantSelector'
import QuantitySelector    from './QuantitySelector'
import type { Product, ProductVariant } from '@/types'

interface Props { product: Product }

export default function ProductInfo({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? (product as any).product_variants?.[0] ?? null
  )
  const [qty,     setQty]     = useState(1)
  const [adding,  setAdding]  = useState(false)
  const [accord,  setAccord]  = useState(false)
  const [showATC, setShowATC] = useState(false)
  const atcRef  = useRef<HTMLButtonElement>(null)
  const increment = useCartStore(s => s.increment)

  const variants  = product.variants ?? (product as any).product_variants ?? []
  const price     = selectedVariant?.price_override ?? product.base_price
  const totalQty  = variants.reduce((s: number, v: any) => s + (v.stock_qty ?? 0), 0)
  const soldOut   = totalQty === 0 && product.stock_type !== 'preorder'
  const priceStr  = `₦${price.toLocaleString()}`

  /* ── IntersectionObserver: show sticky bar when inline ATC scrolls out ── */
  useEffect(() => {
    const el = atcRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowATC(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleAdd = useCallback(async () => {
    if (!selectedVariant) return toast.error('Please select a variant')
    setAdding(true)
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variant_id: selectedVariant.id, quantity: qty }),
      })
      increment(qty)
      toast.success(`${product.name} ×${qty} added to cart`)
    } catch (err: any) {
      toast.error(err.message || 'Sign in to add to cart')
    } finally {
      setAdding(false)
    }
  }, [selectedVariant, qty, product.name, increment])

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Category label */}
        {product.category?.name && (
          <p style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '11px',
            fontWeight:    600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         'var(--text-muted)',
          }}>
            {product.category?.name}
          </p>
        )}

        {/* Product name */}
        <h1 style={{
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(28px, 5vw, 48px)',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color:         'var(--text-primary)',
          lineHeight:    1.05,
        }}>
          {product.name}
        </h1>

        {/* Price */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize:   '22px',
          fontWeight: 700,
          color:      '#3DBA6F',
        }}>
          {priceStr}
        </p>

        {/* Description */}
        {product.description && (
          <p style={{
            fontFamily:  'var(--font-body)',
            fontSize:    '14px',
            lineHeight:  1.7,
            color:       'var(--text-muted)',
            maxWidth:    '480px',
          }}>
            {product.description}
          </p>
        )}

        {/* Variant selector */}
        {variants.length > 0 && (
          <VariantSelector
            variants={variants}
            selected={selectedVariant}
            onChange={setSelectedVariant}
          />
        )}

        {/* Qty + ATC row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
          <QuantitySelector
            value={qty}
            onChange={setQty}
            max={selectedVariant?.stock_qty ?? 10}
            disabled={soldOut}
          />

          <button
            ref={atcRef}
            onClick={handleAdd}
            disabled={adding || soldOut}
            aria-label={soldOut ? 'Sold out' : `Add ${product.name} to cart`}
            style={{
              flex:          1,
              height:        '52px',
              background:    soldOut ? 'transparent' : adding ? '#2EA05A' : '#3DBA6F',
              border:        soldOut ? '1px solid var(--border)' : 'none',
              color:         soldOut ? 'var(--text-muted)' : '#0A0A0A',
              fontFamily:    'var(--font-body)',
              fontSize:      '13px',
              fontWeight:    700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor:        soldOut || adding ? 'not-allowed' : 'pointer',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              gap:           '8px',
              transition:    'background 150ms',
              borderRadius:  0,
            }}
          >
            {adding
              ? <Loader2 size={14} className="animate-spin" />
              : <ShoppingBag size={14} strokeWidth={2} />
            }
            {soldOut ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>

        {/* Delivery accordion */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}>
          <button
            onClick={() => setAccord(a => !a)}
            style={{
              width:         '100%',
              display:       'flex',
              justifyContent:'space-between',
              alignItems:    'center',
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              padding:       '4px 0',
              color:         'var(--text-primary)',
              fontFamily:    'var(--font-body)',
              fontSize:      '13px',
              fontWeight:    600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Delivery & Pickup
            <ChevronDown
              size={16}
              style={{ transition: 'transform 200ms', transform: accord ? 'rotate(180deg)' : 'none' }}
            />
          </button>
          {accord && (
            <p style={{
              fontFamily:  'var(--font-body)',
              fontSize:    '13px',
              lineHeight:  1.7,
              color:       'var(--text-muted)',
              paddingTop:  '10px',
            }}>
              Orders are dispatched within 1–3 working days on campus.
              Payment proof must be submitted after checkout.
              Contact an admin via the WhatsApp group for urgent orders.
            </p>
          )}
        </div>
      </div>

      {/* Sticky ATC — mobile only, appears when inline button scrolls out */}
      <StickyATC
        show={showATC}
        onAdd={handleAdd}
        soldOut={soldOut}
        adding={adding}
        price={priceStr}
        name={product.name}
      />
    </>
  )
}
