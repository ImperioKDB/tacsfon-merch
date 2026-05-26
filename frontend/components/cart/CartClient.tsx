'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import { RefreshCw } from 'lucide-react';
import type { Cart } from '@/types';

export default function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<Cart>('/cart');
      setCart(data);
    } catch (err) {
      console.error("Cart Load Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-gold" size={32} />
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-zinc-400 mb-6">Failed to load your cart. Check your connection.</p>
      <button onClick={fetchCart} className="bg-gold text-black px-8 py-2 font-bold uppercase">Retry</button>
    </div>
  );

  const items = cart?.items ?? [];
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
           {items.map(item => <CartItemRow key={item.id} item={item} onQuantityChange={() => fetchCart()} onRemove={() => fetchCart()} />)}
        </div>
        <CartSummary total={cart?.total || 0} itemCount={items.length} onClearCart={() => fetchCart()} />
      </div>
    </div>
  );
}
