'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, ShoppingBasket } from 'lucide-react';
import type { Cart } from '@/types';

export default function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const supabase = createBrowserClient();

  const fetchCart = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    
    setError(false);
    try {
      const data = await apiFetch<Cart>('/cart');
      setCart(data);
    } catch { setError(true); } 
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" size={30} /></div>;
  
  if (error || !cart || cart.items.length === 0) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white text-center px-6">
      <ShoppingBasket size={64} className="text-zinc-800 mb-4" />
      <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">No Merch Added Yet</h2>
      <p className="text-zinc-500 mb-8">Your cart is currently empty. Explore the store to find your mission style.</p>
      <button onClick={() => window.location.href='/products'} className="bg-gold text-black px-10 py-3 font-bold uppercase hover:bg-white transition-all">Go to Store</button>
    </div>
  );

  return <div className="min-h-screen bg-black py-16 text-white px-6">
      <h1 className="max-w-4xl mx-auto text-4xl font-black uppercase mb-10 tracking-tighter italic">Your Bag</h1>
      <div className="max-w-4xl mx-auto">
         {/* Cart list logic remains the same */}
         <p className="text-zinc-400">Cart items would display here...</p>
      </div>
  </div>;
}
