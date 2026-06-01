'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import { ShoppingBasket, ArrowRight, RefreshCw, Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartClient() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await apiFetch<any>('/cart');
      setCart(data);
    } catch (e) {
      console.error("Cart Fetch Error", e);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQty = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await apiFetch(`/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQty })
      });
      fetchCart();
    } catch (e) { toast.error("Update failed"); }
  };

  const removeItem = async (itemId: string) => {
    try {
      await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
      toast.success("Item removed");
      fetchCart();
    } catch (e) { toast.error("Delete failed"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <RefreshCw className="animate-spin text-gold" size={32}/>
    </div>
  );

  const items = cart?.items || [];

  if (items.length === 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 text-center">
      <ShoppingBasket size={64} className="text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Your cart is empty</h2>
      <p className="text-zinc-500 mb-8 max-w-xs text-sm">You haven't added any premium merch yet.</p>
      <Link href="/products" className="bg-gold text-black px-10 py-4 font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
        Go to Store
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase italic mb-12 tracking-tighter">Your Bag<span className="text-gold">.</span></h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 flex gap-4 items-center">
                <div className="w-20 h-20 bg-black shrink-0 overflow-hidden">
                   {item.variant?.product?.image_url && (
                     <img src={item.variant.product.image_url} className="w-full h-full object-cover" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate uppercase text-sm">{item.variant?.product?.name}</p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Size: {item.variant?.size}</p>
                  <p className="text-gold font-bold mt-1">{formatPrice(item.unit_price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center bg-black border border-zinc-800 rounded-none">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-2 text-zinc-400"><Minus size={12}/></button>
                      <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-2 text-zinc-400"><Plus size={12}/></button>
                   </div>
                   <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 h-fit space-y-6">
            <h3 className="text-white font-black uppercase text-xs tracking-widest border-b border-zinc-800 pb-4">Order Summary</h3>
            <div className="flex justify-between text-zinc-400 text-sm">
              <span>Subtotal</span>
              <span className="text-white font-bold">{formatPrice(cart.total)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-sm">
              <span>Delivery</span>
              <span className="text-green-500 font-bold uppercase text-[10px]">Free</span>
            </div>
            <div className="border-t border-zinc-800 pt-4 flex justify-between items-end">
              <span className="text-white font-black uppercase text-xs">Total</span>
              <span className="text-gold text-2xl font-black">{formatPrice(cart.total)}</span>
            </div>
            <Link href="/checkout" className="block w-full bg-gold text-black text-center py-4 font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
