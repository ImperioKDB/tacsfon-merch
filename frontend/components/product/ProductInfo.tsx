'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ShoppingBag, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart'
import { apiFetch } from '@/lib/api/fetch'
import StickyATC from '@/components/product/StickyATC'
import VariantSelector from './VariantSelector'
import QuantitySelector from './QuantitySelector'
import type { Product, ProductVariant } from '@/types'

export default function ProductInfo({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? (product as any).product_variants?.[0] ?? null
  )
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [accord, setAccord] = useState(false)
  const [showATC, setShowATC] = useState(false)
  const atcRef = useRef<HTMLButtonElement>(null)
  const increment = useCartStore(s => s.increment)

  const variants = product.variants ?? (product as any).product_variants ?? []
  const price = selectedVariant?.price_override ?? product.base_price
  const totalQty = variants.reduce((s: number, v: any) => s + (v.stock_qty ?? 0), 0)
  const soldOut = totalQty === 0 && product.stock_type !== 'preorder'
  const priceStr = `₦${price.toLocaleString()}`

  useEffect(() => {
    const el = atcRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setShowATC(!entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleAdd = useCallback(async () => {
    if (!selectedVariant) return toast.error('Please select a variant')
    setAdding(true)
    try {
      await apiFetch('/cart/items', { method: 'POST', body: JSON.stringify({ variant_id: selectedVariant.id, quantity: qty }) })
      increment(qty); toast.success(`${product.name} added to cart`);
    } catch (err: any) { toast.error(err.message || 'Sign in to add to cart') }
    finally { setAdding(false) }
  }, [selectedVariant, qty, product.name, increment])

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* FIX: category_name -> category?.name */}
        {product.category?.name && (
          <p className="font-body text-[10px] font-black uppercase tracking-[.3em] text-zinc-500">{product.category.name}</p>
        )}
        <h1 className="font-display text-[clamp(32px,6vw,52px)] leading-none uppercase tracking-tighter italic text-white">
          {product.name}
        </h1>
        <p className="font-body text-xl font-bold text-[#3DBA6F]">{priceStr}</p>
        {product.description && (
          <p className="font-body text-sm leading-relaxed text-zinc-500 max-w-md">{product.description}</p>
        )}

        <VariantSelector variants={variants} selected={selectedVariant} onChange={setSelectedVariant} />
        
        <div className="flex gap-3 pt-4">
          <QuantitySelector value={qty} onChange={setQty} max={selectedVariant?.stock_qty ?? 99} />
          <button ref={atcRef} onClick={handleAdd} disabled={adding || soldOut} className="flex-1 h-14 bg-[#3DBA6F] text-black font-black text-[11px] uppercase tracking-[.2em] flex items-center justify-center gap-3">
             {adding ? <Loader2 className="animate-spin" size={16}/> : <ShoppingBag size={16}/>}
             {soldOut ? 'Sold Out' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <StickyATC show={showATC} onAdd={handleAdd} soldOut={soldOut} adding={adding} price={priceStr} name={product.name} />
    </>
  )
}