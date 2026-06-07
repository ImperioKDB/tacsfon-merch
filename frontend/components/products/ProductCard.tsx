'use client'

import { useState }        from 'react'
import Image               from 'next/image'
import Link                from 'next/link'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { toast }           from 'sonner'
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
  const [adding, setAdding] = useState(false)
  const increment = useCartStore(s => s.increment)

  const variants     = product.product_variants ?? product.variants ?? []
  const firstVariant = variants[0]
  const totalQty     = variants.reduce((s, v) => s + (v.stock_qty ?? 0), 0)
  const soldOut      = totalQty === 0 && product.stock_type !== 'preorder'

  const prices   = variants.map(v => v.price_override ?? product.base_price)
  const min      = prices.length ? Math.min(...prices) : product.base_price
  const max      = prices.length ? Math.max(...prices) : product.base_price
  const priceStr = min === max
    ? `\u20a6${min.toLocaleString()}`
    : `from \u20a6${min.toLocaleString()}`
  const img = resolveImageUrl(product.image_url)

  const badge =
    product.stock_type === 'preorder'   ? { label: 'Pre-order', color: 'var(--accent)',   bg: 'var(--accent-dim)' }
    : totalQty <= 3 && totalQty > 0     ? { label: 'Low Stock', color: 'var(--danger)',   bg: 'rgba(224,82,82,0.10)' }
    : totalQty === 0                    ? { label: 'Sold Out',  color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' }
    : null

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (soldOut) return
    if (!firstVariant) {
      toast.error('Choose a variant on the product page')
      return
    }
    setAdding(true)
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body:   JSON.stringify({ variant_id: firstVariant.id, quantity: 1 }),
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
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      background:    'var(--bg-surface)',
      border:        '1px solid var(--border)',
      overflow:      'hidden',
      transition:    'border-color 200ms ease',
      height:        '100%',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Image — tap goes to product detail */}
      <Link
        href={`/products/${product.id}`}
        style={{ display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', flexShrink: 0 }}
        aria-label={`View ${product.name}`}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover', transition: 'transform 400ms ease' }}
            unoptimized
            onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)')}
            onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
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

        {/* Stock badge */}
        {badge && (
          <span style={{
            position:      'absolute',
            top:           '8px',
            left:          '8px',
            fontFamily:    'var(--font-body)',
            fontSize:      '9px',
            fontWeight:    700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         badge.color,
            background:    badge.bg,
            padding:       '3px 8px',
            border:        `1px solid ${badge.color}40`,
          }}>
            {badge.label}
          </span>
        )}
      </Link>

      {/* Name + price label — always visible */}
      <div style={{
        padding:      '10px 12px 8px',
        borderTop:    '1px solid var(--border)',
        background:   'var(--bg-surface)',
        flexShrink:   0,
      }}>
        <p style={{
          margin:        '0 0 3px',
          fontFamily:    'var(--font-display)',
          fontSize:      '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color:         'var(--text-primary)',
          lineHeight:    1.2,
          overflow:      'hidden',
          whiteSpace:    'nowrap',
          textOverflow:  'ellipsis',
        }}>
          {product.name}
        </p>
        <p style={{
          margin:     0,
          fontFamily: 'var(--font-body)',
          fontSize:   '12px',
          fontWeight: 700,
          color:      'var(--accent)',
        }}>
          {priceStr}
        </p>
      </div>

      {/* Add to Cart button — full width, no stepper */}
      <button
        onClick={handleAdd}
        disabled={adding || soldOut}
        aria-label={soldOut ? 'Sold out' : `Add ${product.name} to cart`}
        style={{
          width:         '100%',
          height:        '44px',
          flexShrink:    0,
          background:    soldOut
            ? 'var(--bg-elevated)'
            : adding
              ? '#2A9E5A'
              : '#3DBA6F',
          border:        'none',
          borderTop:     '1px solid var(--border)',
          color:         soldOut ? 'var(--text-muted)' : '#0A0A0A',
          fontFamily:    'var(--font-body)',
          fontSize:      '11px',
          fontWeight:    700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor:        soldOut || adding ? 'not-allowed' : 'pointer',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          gap:           '7px',
          transition:    'background 150ms ease',
          whiteSpace:    'nowrap',
        }}
        onMouseEnter={e => {
          if (!soldOut && !adding)
            (e.currentTarget as HTMLButtonElement).style.background = '#2A9E5A'
        }}
        onMouseLeave={e => {
          if (!soldOut && !adding)
            (e.currentTarget as HTMLButtonElement).style.background = '#3DBA6F'
        }}
      >
        {adding ? (
          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <ShoppingBag size={13} strokeWidth={2} />
        )}
        {soldOut ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart'}
      </button>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
