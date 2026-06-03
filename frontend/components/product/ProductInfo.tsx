'use client'

/**
 * ProductInfo — Phase 5
 *
 * Right sticky panel of the product detail page.
 * Layout (top to bottom):
 *   1. Category label
 *   2. Product name (Bebas Neue)
 *   3. Stock badges (Preorder / Low Stock / Out of Stock)
 *   4. Price (gold)
 *   5. Gold rule
 *   6. Description
 *   7. VariantSelector
 *   8. QuantitySelector
 *   9. Add to Cart CTA
 *  10. Delivery accordion
 *  11. Trust strip
 *
 * Mobile sticky bar appears after main CTA scrolls out of view.
 * Inline CSS only — no Tailwind utility classes.
 */

import { useState, useRef, useEffect }    from 'react'
import { ShoppingCart, ChevronDown,
         Truck, RotateCcw, ShieldCheck } from 'lucide-react'
import { toast }                          from 'sonner'
import { formatPrice }                    from '@/lib/utils/formatters'
import { useCartStore }                   from '@/store/cart'
import { apiFetch }                       from '@/lib/api/fetch'
import VariantSelector                    from './VariantSelector'
import QuantitySelector                   from './QuantitySelector'
import type { ProductVariant }            from '@/types'

interface Product {
  id:               string
  name:             string
  description:      string | null
  base_price:       number
  stock_type:       'stock' | 'preorder' | 'both'
  is_available:     boolean
  image_url:        string | null
  model_url?:       string | null
  category?:        { id: string; name: string } | null
  product_variants?: ProductVariant[]
}

interface Props { product: Product }

// ── Accordion ────────────────────────────────────────────────────────
function AccordionItem({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '14px 0',
          background:     'transparent',
          border:         'none',
          cursor:         'pointer',
          color:          'var(--text-primary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--accent)' }}>{icon}</span>
          {title}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 200ms ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? '200px' : '0', transition: 'max-height 250ms ease' }}>
        <div style={{ paddingBottom: '14px', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────
export default function ProductInfo({ product }: Props) {
  const variants       = (product.product_variants ?? []) as ProductVariant[]
  const firstAvailable = variants.find(v => v.stock_qty > 0) ?? variants[0] ?? null

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(firstAvailable)
  const [quantity,        setQuantity]         = useState(1)
  const [isAdding,        setIsAdding]         = useState(false)
  const [stickyVisible,   setStickyVisible]    = useState(false)

  const ctaRef        = useRef<HTMLButtonElement>(null)
  const incrementCart = useCartStore(s => s.increment)

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const price      = selectedVariant?.price_override ?? product.base_price
  const lowStock   = selectedVariant ? selectedVariant.stock_qty > 0 && selectedVariant.stock_qty <= 5 : false
  const outOfStock = selectedVariant ? selectedVariant.stock_qty === 0 : false
  const isPreorder = product.stock_type === 'preorder' || product.stock_type === 'both'

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error('Please select a size or colour')
    setIsAdding(true)
    try {
      await apiFetch('/cart/items', { method: 'POST', body: JSON.stringify({ variant_id: selectedVariant.id, quantity }) })
      incrementCart(quantity)
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const ctaLabel   = isAdding ? 'ADDING…' : outOfStock ? 'OUT OF STOCK' : 'ADD TO CART'
  const ctaBg      = outOfStock ? 'var(--bg-elevated)' : 'var(--accent)'
  const ctaColor   = outOfStock ? 'var(--text-muted)' : '#0A0A0A'
  const ctaBorder  = outOfStock ? '1px solid var(--border)' : 'none'
  const ctaCursor  = (isAdding || outOfStock) ? 'not-allowed' : 'pointer'

  const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
    padding: '4px 10px', background: bg, border: `1px solid ${color}40`,
    color, fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>

        {product.category?.name && (
          <p style={{ fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
            {product.category.name}
          </p>
        )}

        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 0.95, letterSpacing: '0.02em', color: 'var(--text-primary)', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
            {product.name}
          </h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isPreorder  && <span style={badgeStyle('rgba(201,168,76,0.12)',  'var(--accent)')}>Preorder</span>}
            {lowStock    && <span style={badgeStyle('rgba(224,82,82,0.12)',   '#E05252')}>Low Stock</span>}
            {outOfStock && !isPreorder && <span style={badgeStyle('rgba(136,136,128,0.10)', 'var(--text-muted)')}>Out of Stock</span>}
          </div>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '26px', fontWeight: 700, color: 'var(--accent)', margin: 0, letterSpacing: '-0.01em' }}>
          {formatPrice(price)}
        </p>

        <div style={{ height: '1px', background: 'var(--border)' }} />

        {product.description && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            {product.description}
          </p>
        )}

        {variants.length > 0 && (
          <VariantSelector
            variants={variants}
            selectedId={selectedVariant?.id ?? null}
            onSelect={v => { setSelectedVariant(v); setQuantity(1) }}
          />
        )}

        <div>
          <p style={{ marginBottom: '10px', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Quantity
          </p>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        <button
          ref={ctaRef}
          onClick={handleAddToCart}
          disabled={isAdding || outOfStock}
          style={{
            width: '100%', minHeight: '56px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', background: ctaBg, border: ctaBorder,
            color: ctaColor, fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', cursor: ctaCursor,
            opacity: isAdding ? 0.7 : 1, transition: 'background 200ms, opacity 200ms',
          }}
        >
          <ShoppingCart size={16} strokeWidth={2.5} />
          {ctaLabel}
        </button>

        <div style={{ borderTop: '1px solid var(--border)' }}>
          <AccordionItem icon={<Truck size={14} />} title="Delivery Information">
            Orders are fulfilled within 3–7 business days. Campus pickup is available.
            You will receive a notification once your order is dispatched.
          </AccordionItem>
          <AccordionItem icon={<RotateCcw size={14} />} title="Returns & Exchanges">
            Merch is made to order. Exchanges accepted within 7 days of receipt for sizing
            issues. Contact the TACSFON team to initiate a return.
          </AccordionItem>
          <AccordionItem icon={<ShieldCheck size={14} />} title="Bulk Orders">
            Ordering for a group or event? You can add up to 9,999 units per item.
            Contact us for department-level bulk pricing.
          </AccordionItem>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Secure Checkout', 'Official TACSFON Merch', 'Student Support'].map(label => (
            <span key={label} style={{ fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div
        style={{
          position:       'fixed',
          bottom:         0,
          left:           0,
          right:          0,
          zIndex:         90,
          background:     'var(--bg-base)',
          borderTop:      '1px solid var(--border)',
          padding:        '12px 16px',
          display:        stickyVisible ? 'flex' : 'none',
          gap:            '12px',
          alignItems:     'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
          {formatPrice(price)}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={isAdding || outOfStock}
          style={{
            flex: 1, minHeight: '48px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', background: ctaBg, border: ctaBorder,
            color: ctaColor, fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', cursor: ctaCursor,
            opacity: isAdding ? 0.7 : 1, transition: 'background 200ms',
          }}
        >
          <ShoppingCart size={14} strokeWidth={2.5} />
          {ctaLabel}
        </button>
      </div>
    </>
  )
}
