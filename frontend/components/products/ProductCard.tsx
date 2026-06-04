'use client'

import { useState }   from 'react'
import Image          from 'next/image'
import Link           from 'next/link'
import { ShoppingBag, Loader2, Plus, Minus } from 'lucide-react'
import { toast }      from 'sonner'
import { resolveImageUrl } from '@/lib/utils/formatters'
import { useCartStore }    from '@/store/cart'
import { apiFetch }        from '@/lib/api/fetch'

interface Variant {
  id:             string
  size:           string
  color:          string
  stock_qty:      number
  price_override: number | null
}

interface Product {
  id:                string
  name:              string
  base_price:        number
  image_url:         string | null
  stock_type:        'stock' | 'preorder' | 'both'
  is_available:      boolean
  product_variants?: Variant[]
  variants?:         Variant[]
}

export default function ProductCard({ product }: { product: Product }) {
  const [qty,    setQty]    = useState(1)
  const [adding, setAdding] = useState(false)
  const increment = useCartStore(s => s.increment)

  const variants     = product.product_variants ?? product.variants ?? []
  const firstVariant = variants[0]
  const totalQty     = variants.reduce((s, v) => s + (v.stock_qty ?? 0), 0)
  const soldOut      = totalQty === 0 && product.stock_type !== 'preorder'

  const prices   = variants.map(v => v.price_override ?? product.base_price)
  const min      = prices.length ? Math.min(...prices) : product.base_price
  const max      = prices.length ? Math.max(...prices) : product.base_price
  const priceStr = min === max ? `\u20a6${min.toLocaleString()}` : `from \u20a6${min.toLocaleString()}`
  const img      = resolveImageUrl(product.image_url)

  const badge =
    product.stock_type === 'preorder'     ? { label: 'Pre-order', color: '#3DBA6F', bg: 'rgba(61,186,111,0.10)' }
    : totalQty <= 3 && totalQty > 0       ? { label: 'Low Stock', color: '#E05252', bg: 'rgba(224,82,82,0.10)' }
    : totalQty === 0                      ? { label: 'Sold Out',  color: '#555',    bg: 'rgba(255,255,255,0.05)' }
    : null

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!firstVariant) return toast.error('Select a variant on the product page')
    setAdding(true)
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variant_id: firstVariant.id, quantity: qty }),
      })
      increment(qty)
      toast.success(`${product.name} \u00d7${qty} added to cart`)
    } catch (err: any) {
      toast.error(err.message || 'Sign in to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const changeQty = (delta: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQty(q => Math.max(1, Math.min(10, q + delta)))
  }

  return (
    <div className="product-card">

      {/* ── Image (tap = go to product, hover = name/price panel) ── */}
      <Link
        href={`/products/${product.id}`}
        style={{ display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}
        aria-label={`View ${product.name}`}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card__image"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingBag size={28} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Gradient overlay on hover/touch */}
        <div className="product-card__overlay" aria-hidden />

        {/* Name + price — revealed on hover/touch */}
        <div className="product-card__info" style={{ pointerEvents: 'none' }}>
          <p style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         '#fff',
            lineHeight:    1.15,
            marginBottom:  '3px',
            textShadow:    '0 1px 6px rgba(0,0,0,0.7)',
          }}>
            {product.name}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '11px',
            fontWeight: 700,
            color:      '#3DBA6F',
          }}>
            {priceStr}
          </p>
        </div>

        {/* Stock badge */}
        {badge && (
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: badge.color, background: badge.bg,
            padding: '3px 8px', border: `1px solid ${badge.color}40`,
          }}>
            {badge.label}
          </span>
        )}
      </Link>

      {/* ── Bottom action bar: qty stepper + Add to Cart ── */}
      <div style={{
        borderTop:   '1px solid var(--border)',
        display:     'flex',
        alignItems:  'center',
        height:      '42px',
      }}>
        {/* Minus */}
        <button
          onClick={e => changeQty(-1, e)}
          disabled={qty <= 1 || soldOut}
          aria-label="Decrease quantity"
          style={{
            width:          '34px',
            height:         '100%',
            background:     'none',
            border:         'none',
            borderRight:    '1px solid var(--border)',
            color:          qty <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor:         qty <= 1 || soldOut ? 'default' : 'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            opacity:        soldOut ? 0.35 : 1,
            transition:     'color 120ms',
          }}
        >
          <Minus size={11} strokeWidth={2} />
        </button>

        {/* Qty display */}
        <span style={{
          width:          '28px',
          textAlign:      'center',
          fontFamily:     'var(--font-body)',
          fontSize:       '11px',
          fontWeight:     700,
          color:          soldOut ? 'var(--text-muted)' : 'var(--text-primary)',
          flexShrink:     0,
          opacity:        soldOut ? 0.35 : 1,
        }}>
          {qty}
        </span>

        {/* Plus */}
        <button
          onClick={e => changeQty(1, e)}
          disabled={qty >= 10 || soldOut}
          aria-label="Increase quantity"
          style={{
            width:          '34px',
            height:         '100%',
            background:     'none',
            border:         'none',
            borderRight:    '1px solid var(--border)',
            color:          qty >= 10 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor:         qty >= 10 || soldOut ? 'default' : 'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            opacity:        soldOut ? 0.35 : 1,
            transition:     'color 120ms',
          }}
        >
          <Plus size={11} strokeWidth={2} />
        </button>

        {/* Add to cart — fills remaining space */}
        <button
          onClick={handleAdd}
          disabled={adding || soldOut}
          aria-label={soldOut ? 'Sold out' : `Add ${product.name} to cart`}
          style={{
            flex:           1,
            height:         '100%',
            background:     soldOut ? 'transparent' : adding ? '#2EA05A' : '#3DBA6F',
            border:         'none',
            color:          soldOut ? 'var(--text-muted)' : '#0A0A0A',
            fontFamily:     'var(--font-body)',
            fontSize:       '9px',
            fontWeight:     700,
            letterSpacing:  '0.14em',
            textTransform:  'uppercase',
            cursor:         soldOut || adding ? 'not-allowed' : 'pointer',
            opacity:        soldOut ? 0.4 : 1,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '6px',
            transition:     'background 150ms, opacity 150ms',
          }}
        >
          {adding
            ? <Loader2 size={11} className="animate-spin" />
            : <ShoppingBag size={11} strokeWidth={2} />
          }
          {soldOut ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>

    </div>
  )
}
