'use client'
import { useState } from 'react'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart'
import { apiFetch } from '@/lib/api/fetch'
import VariantSelector from './VariantSelector'
import QuantitySelector from './QuantitySelector'
import type { Product, ProductVariant } from '@/types'

export default function ProductInfo({ product }: { product: Product }) {
  const variants = product.variants ?? (product as any).product_variants ?? []
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] || null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const increment = useCartStore(s => s.increment)

  const price = selectedVariant?.price_override ?? product.base_price
  const soldOut = variants.reduce((s: number, v: any) => s + (v.stock_qty ?? 0), 0) === 0 && product.stock_type !== 'preorder'

  const handleAdd = async () => {
    if (!selectedVariant) return toast.error('Select variant')
    setAdding(true)
    try {
      await apiFetch('/cart/items', { method: 'POST', body: JSON.stringify({ variant_id: selectedVariant.id, quantity: qty }) })
      increment(qty); toast.success('Added to bag');
    } catch (err: any) { toast.error(err.message) }
    finally { setAdding(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        {product.category_name && (
          <p style={{
            fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.4em', color: 'var(--text-muted)', marginBottom: '8px'
          }}>
            {product.category_name}
          </p>
        )}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '36px', textTransform: 'uppercase',
          fontStyle: 'italic', lineHeight: 1, margin: '0 0 12px 0', color: 'var(--text-primary)'
        }}>
          {product.name}
        </h1>
        <p style={{
          fontSize: '24px', fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--accent)', margin: 0
        }}>
          ₦{price?.toLocaleString()}
        </p>
      </div>

      <VariantSelector variants={variants} selectedId={selectedVariant?.id || null} onSelect={setSelectedVariant} />
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <QuantitySelector value={qty} onChange={setQty} />
        <button 
          onClick={handleAdd} 
          disabled={adding || soldOut} 
          style={{
            flex: 1, background: soldOut ? 'var(--bg-elevated)' : 'var(--accent)', color: soldOut ? 'var(--text-muted)' : '#0A0A0A',
            fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase', padding: '16px', fontSize: '12px',
            letterSpacing: '0.15em', border: 'none', cursor: adding || soldOut ? 'not-allowed' : 'pointer',
            transition: 'background 200ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
          onMouseEnter={e => { if (!adding && !soldOut) e.currentTarget.style.background = '#ffffff' }}
          onMouseLeave={e => { if (!adding && !soldOut) e.currentTarget.style.background = 'var(--accent)' }}
        >
          {adding ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {adding ? 'PROCESSING...' : soldOut ? 'SOLD OUT' : 'ADD TO BAG'}
        </button>
      </div>
    </div>
  )
}
