'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { RefreshCw, User, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // Step 1: Get Profile (Essential)
        const pData = await apiFetch('/auth/session');
        setProfile(pData);
        
        // Step 2: Get Orders (Non-Essential, don't crash if fails)
        try {
          const oData: any = await apiFetch('/orders');
          setOrderCount(Array.isArray(oData) ? oData.length : 0);
        } catch (e) {
          console.error("Orders failed to load but keeping profile visible.");
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gold">
      <RefreshCw className="animate-spin mb-4" size={32} />
      <p className="text-xs uppercase font-bold tracking-widest">Securing Session...</p>
    </div>
  );

  if (error || !user) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4"/>
      <h2 className="text-xl font-bold mb-2">ACCESS EXPIRED</h2>
      <p className="text-zinc-500 mb-6">Your secure connection has timed out.</p>
      <button onClick={() => window.location.href='/login'} className="bg-gold text-black px-10 py-3 font-bold uppercase">Re-Authenticate</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-24 px-6 text-white">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-10">
        <div className="flex justify-between items-start mb-10 border-b border-zinc-800 pb-6">
           <h1 className="text-4xl font-black uppercase italic tracking-tighter">Account</h1>
           <button onClick={signOut} className="text-red-500 text-xs font-bold uppercase border border-red-500/20 px-3 py-1">Log Out</button>
        </div>
        <div className="space-y-8">
          <div><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Full Name</p><p className="text-xl font-bold">{profile?.full_name || user.email}</p></div>
          <div><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Email</p><p className="text-xl font-bold">{profile?.email || user.email}</p></div>
          <div className="bg-black p-6 border border-zinc-800 mt-4">
             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Store Activity</p>
             <p className="text-4xl font-black text-gold">{orderCount} <span className="text-sm text-zinc-500 font-normal">Orders Placed</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
