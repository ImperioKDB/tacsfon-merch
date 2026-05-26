'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { formatDate } from '@/lib/utils/formatters';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, oData] = await Promise.all([
          apiFetch('/auth/session'),
          apiFetch('/orders')
        ]);
        setProfile(pData);
        setOrderCount(Array.isArray(oData) ? oData.length : 0);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gold">
      <RefreshCw className="animate-spin mb-4" size={32} />
      <p className="text-xs uppercase font-bold tracking-[0.2em]">Verifying Identity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-24 px-6 text-white">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-10 border-b border-zinc-800 pb-6">Account</h1>
        <div className="space-y-8">
          <div><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Full Name</p><p className="text-xl font-bold">{profile?.full_name || 'User'}</p></div>
          <div><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Email</p><p className="text-xl font-bold">{profile?.email}</p></div>
          <div><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Orders</p><p className="text-3xl font-black text-gold">{orderCount}</p></div>
        </div>
      </div>
    </div>
  );
}
