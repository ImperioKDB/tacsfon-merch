'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';
import { ShoppingBasket, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Cart } from '@/types';

export default function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await apiFetch<Cart>('/cart');
      setCart(data);
    } catch (err) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold uppercase tracking-widest">Loading Cart...</div>;

  if (!cart || !cart.items || cart.items.length === 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
      <ShoppingBasket size={64} className="text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Your cart is empty</h2>
      <p className="text-zinc-500 mb-8 text-center max-w-xs">No Merch added to Cart yet. Start exploring our premium collection.</p>
      <Link href="/products" className="bg-gold text-black px-8 py-3 font-bold uppercase flex items-center gap-2 hover:bg-white transition-all">
        Go to Store <ArrowRight size={18}/>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-20 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
        <div className="flex-1 space-y-4">
           <h1 className="text-white text-3xl font-black uppercase mb-6 tracking-tighter">Your Bag</h1>
           {cart.items.map(item => <CartItemRow key={item.id} item={item} onQuantityChange={() => fetchCart()} onRemove={() => fetchCart()} />)}
        </div>
        <CartSummary total={cart.total} itemCount={cart.items.length} onClearCart={() => fetchCart()} />
      </div>
    </div>
  );
}
