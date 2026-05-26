'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { formatDate } from '@/lib/utils/formatters';
import { User, Mail, Phone, Calendar, ShoppingBag, RefreshCw } from 'lucide-react';
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  if (loading || authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black py-20 px-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 uppercase tracking-tighter italic">Account Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-gold flex items-center justify-center text-black font-black text-2xl">{profile?.full_name?.charAt(0)}</div>
               <div>
                  <p className="text-xl font-bold text-white">{profile?.full_name}</p>
                  <p className="text-gold text-xs font-bold uppercase tracking-widest">{profile?.role}</p>
               </div>
            </div>
            <div className="space-y-3 text-zinc-400 text-sm">
              <div className="flex items-center gap-2"><Mail size={16}/> {profile?.email}</div>
              <div className="flex items-center gap-2"><Phone size={16}/> {profile?.phone || "No phone added"}</div>
              <div className="flex items-center gap-2"><Calendar size={16}/> Joined {formatDate(profile?.created_at)}</div>
            </div>
          </div>
          
          <div className="bg-black border border-zinc-800 p-6 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="text-gold mb-2" size={32}/>
            <p className="text-4xl font-black text-white">{orderCount}</p>
            <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Total Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
