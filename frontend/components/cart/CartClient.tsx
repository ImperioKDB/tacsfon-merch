'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import { ShoppingBasket, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CartClient() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await apiFetch('/cart');
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" /></div>;

  if (!cart || !cart.items || cart.items.length === 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 text-center">
      <ShoppingBasket size={64} className="text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Your cart is empty</h2>
      <p className="text-zinc-500 mb-8 max-w-xs">No Merch added to Cart yet. Start exploring our premium collection.</p>
      <Link href="/products" className="bg-gold text-black px-10 py-3 font-bold uppercase flex items-center gap-2 hover:bg-white transition-all">
        Go to Store <ArrowRight size={18}/>
      </Link>
    </div>
  );

  return <div className="min-h-screen bg-black p-10 text-white italic">Cart content logic here...</div>;
}
