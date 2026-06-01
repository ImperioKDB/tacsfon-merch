'use client'
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils/formatters';
import { useCartStore } from '@/store/cart';
import { apiFetch } from '@/lib/api/fetch';

export default function ProductInfo({ product }: { product: any }) {
  const variants = product.product_variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const incrementCart = useCartStore(s => s.increment);

  const price = selectedVariant?.price_override ?? product.base_price;

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error("Please select a size/color");
    setIsAdding(true);
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variant_id: selectedVariant.id, quantity })
      });
      incrementCart(quantity);
      toast.success(`${quantity} item(s) added to cart`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight">
          {product.name}
        </h1>
        <p className="text-gold text-2xl font-black mt-2 font-mono">{formatPrice(price)}</p>
      </div>

      {/* VARIANT SELECTOR */}
      <div className="space-y-6">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Select Specification</p>
        <div className="flex flex-wrap gap-3">
          {variants.map((v: any) => (
            <button 
              key={v.id}
              onClick={() => { setSelectedVariant(v); setQuantity(1); }}
              className={`px-6 py-3 border text-xs font-black uppercase tracking-widest transition-all ${
                selectedVariant?.id === v.id ? 'bg-gold text-black border-gold' : 'border-zinc-800 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {v.size} {v.color !== 'Default' && `• ${v.color}`}
            </button>
          ))}
        </div>
      </div>

      {/* QUANTITY & ACTIONS - UNLIMITED MODE */}
      <div className="pt-8 border-t border-zinc-900 space-y-8">
        <div className="flex items-center gap-6">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Quantity</p>
           <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-white hover:text-gold"><Minus size={16}/></button>
              <span className="w-16 text-center font-black text-white text-lg">{quantity}</span>
              {/* CLAMP REMOVED: Now users can order up to 9,999 */}
              <button onClick={() => setQuantity(Math.min(9999, quantity + 1))} className="p-3 text-white hover:text-gold"><Plus size={16}/></button>
           </div>
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-gold text-black py-5 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white transition-all disabled:opacity-50"
        >
           <ShoppingCart size={20} strokeWidth={3}/> 
           {isAdding ? "PROCESSING..." : "ADD TO CART"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[#A09C94]">
         <div className="p-4 bg-zinc-900/50 border border-zinc-800 flex items-center gap-3">
            <ShieldCheck size={18} className="text-gold"/>
            <span className="text-[9px] font-black uppercase">Bulk Orders Enabled</span>
         </div>
         <div className="p-4 bg-zinc-900/50 border border-zinc-800 flex items-center gap-3">
            <Zap size={18} className="text-gold"/>
            <span className="text-[9px] font-black uppercase">Fast Fulfillment</span>
         </div>
      </div>
    </div>
  );
}
