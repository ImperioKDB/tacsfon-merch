'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, resolveImageUrl } from '@/lib/utils/formatters'
import { useCartStore } from '@/store/cart'
import { apiFetch } from '@/lib/api/fetch'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const incrementCart = useCartStore(s => s.increment)

  const variants = product.variants || (product as any).product_variants || []
  const firstVariant = variants[0]
  const displayPrice = formatPrice(firstVariant?.price_override ?? product.base_price)
  const img = resolveImageUrl(product.image_url)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents clicking the card from opening the product page
    e.stopPropagation();
    
    if (!firstVariant) return toast.error("Product configuration missing");
    
    setIsAdding(true);
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variant_id: firstVariant.id, quantity: qty })
      });
      incrementCart(qty);
      toast.success(`${qty} Added to Cart`);
    } catch (err: any) {
      toast.error(err.message || "Login required to shop");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="group bg-zinc-900/40 border border-zinc-800 hover:border-gold/30 transition-all flex flex-col">
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-zinc-950">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-800">NO IMAGE</div>
        )}
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-tight truncate">{product.name}</h3>
          <p className="text-gold font-black text-lg font-mono">{displayPrice}</p>
        </div>

        {/* INTERACTIVE ROW */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between bg-black/40 border border-zinc-800 p-1">
            <button 
              onClick={(e) => { e.preventDefault(); setQty(Math.max(1, qty - 1)); }}
              className="p-2 text-zinc-500 hover:text-white"
            >
              <Minus size={14}/>
            </button>
            <span className="text-xs font-black text-white w-8 text-center">{qty}</span>
            <button 
              onClick={(e) => { e.preventDefault(); setQty(qty + 1); }}
              className="p-2 text-zinc-500 hover:text-white"
            >
              <Plus size={14}/>
            </button>
          </div>

          <button 
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full bg-white text-black py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold transition-all"
          >
            {isAdding ? <Loader2 size={12} className="animate-spin"/> : <ShoppingCart size={12}/>}
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
