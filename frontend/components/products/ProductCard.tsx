'use client'

import { useState }   from 'react'
import Image          from 'next/image'
import Link           from 'next/link'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { toast }      from 'sonner'
import { formatPrice, resolveImageUrl } from '@/lib/utils/formatters'
import { useCartStore } from '@/store/cart'
import { apiFetch }   from '@/lib/api/fetch'

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

function getStockBadge(product: Product) {
  const variants = product.product_variants ?? product.variants ?? []
  const totalQty = variants.reduce((s, v) => s + (v.stock_qty ?? 0), 0)
  if (product.stock_type === 'preorder') return { label: 'Pre-order', color: '#C9A84C', bg: 'rgba(201,168,76,0.10)' }
  if (totalQty <= 3 && totalQty > 0)    return { label: 'Low Stock', color: '#E05252', bg: 'rgba(224,82,82,0.10)' }
  if (totalQty === 0)                   return { label: 'Sold Out',  color: '#666',    bg: 'rgba(255,255,255,0.05)' }
  return null
}

export default function ProductCard({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false)
  const increment = useCartStore(s => s.increment)

  const variants     = product.product_variants ?? product.variants ?? []
  const firstVariant = variants[0]
  const totalQty     = variants.reduce((s, v) => s + (v.stock_qty ?? 0), 0)
  const badge        = getStockBadge(product)
  const soldOut      = totalQty === 0 && product.stock_type !== 'preorder'

  const rawPrice  = firstVariant?.price_override ?? product.base_price
  const prices    = variants.map(v => v.price_override ?? product.base_price)
  const min       = prices.length ? Math.min(...prices) : product.base_price
  const max       = prices.length ? Math.max(...prices) : product.base_price
  const priceStr  = min === max ? `₦${min.toLocaleString()}` : `from ₦${min.toLocaleString()}`
  const img       = resolveImageUrl(product.image_url)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!firstVariant) return toast.error('Select a variant on the product page')
    setAdding(true)
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variant_id: firstVariant.id, quantity: 1 }),
      })
      increment(1)
      toast.success(`${product.name} added to cart`)
    } catch (err: any) {
      toast.error(err.message || 'Sign in to add to cart')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="product-card">
      {/* ── Image + hover layer ── */}
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

        <div className="product-card__overlay" aria-hidden />

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

      {/* ── Below-image row: name / price / cart ── */}
      <div style={{
        padding:     '10px 12px 11px',
        borderTop:   '1px solid var(--border)',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
      }}>
        {/* Name + price stacked */}
        <Link
          href={`/products/${product.id}`}
          style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}
        >
          <p style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '11px',
            fontWeight:    500,
            letterSpacing: '0.02em',
            color:         'var(--text-primary)',
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            whiteSpace:    'nowrap',
            margin:        '0 0 2px 0',
          }}>
            {product.name}
          </p>
          <p style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.03em',
            color:         'var(--accent)',
            margin:        0,
          }}>
            {priceStr}
          </p>
        </Link>

        {/* Add to cart button */}
        <button
          onClick={handleQuickAdd}
          disabled={adding || soldOut}
          aria-label={soldOut ? 'Sold out' : `Add ${product.name} to cart`}
          title={soldOut ? 'Sold Out' : 'Add to Cart'}
          style={{
            flexShrink:     0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '34px',
            height:         '34px',
            background:     soldOut ? 'var(--bg-elevated)' : adding ? 'var(--accent-hover, #b8922a)' : 'var(--accent)',
            border:         'none',
            color:          soldOut ? 'var(--text-muted)' : '#0A0A0A',
            cursor:         soldOut || adding ? 'not-allowed' : 'pointer',
            opacity:        soldOut ? 0.45 : 1,
            transition:     'background 150ms, opacity 150ms',
          }}
        >
          {adding
            ? <Loader2 size={13} className="animate-spin" />
            : <ShoppingBag size={13} strokeWidth={2} />
          }
        </button>
      </div>
    </div>
  )
}
