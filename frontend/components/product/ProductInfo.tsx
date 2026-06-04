'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
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
    <div className="space-y-8">
      {product.category_name && <p className="text-[10px] font-black uppercase tracking-[.4em] text-zinc-600">{product.category_name}</p>}
      <h1 className="font-display text-4xl uppercase italic leading-none">{product.name}</h1>
      <p className="text-2xl font-bold text-[#3DBA6F]">N{price.toLocaleString()}</p>
      <VariantSelector variants={variants} selectedId={selectedVariant?.id || null} onSelect={setSelectedVariant} />
      <div className="flex gap-4">
        <QuantitySelector value={qty} onChange={setQty} />
        <button onClick={handleAdd} disabled={adding || soldOut} className="flex-1 bg-[#3DBA6F] text-black font-black uppercase py-4 text-xs tracking-widest hover:bg-white transition-all">
          {adding ? 'PROCESSING...' : soldOut ? 'SOLD OUT' : 'ADD TO BAG'}
        </button>
      </div>
    </div>
  )
}