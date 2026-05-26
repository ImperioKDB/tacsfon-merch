'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, User, ShoppingBag } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    }
    if (user) loadProfile();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, supabase]);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gold">
      <RefreshCw className="animate-spin mb-4" size={32} />
      <p className="text-xs uppercase font-bold tracking-widest">Loading Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-24 px-6 text-white">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-10 border-b border-zinc-800 pb-6">My Account</h1>
        <div className="space-y-8">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
            <p className="text-gold font-bold uppercase text-xs">{isAdmin ? 'Administrator' : 'Student Member'}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Full Name</p>
            <p className="text-xl font-bold">{profile?.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Email Address</p>
            <p className="text-xl font-bold">{user?.email}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Phone Number</p>
            <p className="text-xl font-bold">{profile?.phone || 'Not provided'}</p>
          </div>
          
          <button onClick={signOut} className="w-full bg-red-600 text-white font-bold py-4 uppercase tracking-widest text-xs mt-10 hover:bg-red-700 transition-colors">
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
