'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setProfile(data);
        setLoading(false);
      });
    }
  }, [user, supabase]);

  if (authLoading || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" size={32}/></div>;

  return (
    <div className="min-h-screen bg-black py-32 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <h1 className="text-6xl font-black text-white italic">{profile?.full_name?.split(' ')[0] || 'Account'}<span className="text-gold">.</span></h1>
          
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 space-y-4">
             <div className="flex items-center gap-4">
                <ShieldCheck className={isAdmin ? "text-gold" : "text-zinc-600"} size={24}/>
                <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Access Authorization</p>
                   <p className="text-white font-bold uppercase tracking-tighter text-xl">
                      {isAdmin ? "Administrator (Verified)" : "Standard Member"}
                   </p>
                </div>
             </div>
             {!isAdmin && <p className="text-red-500 text-xs font-bold italic">System indicates role mismatch. Please contact support.</p>}
          </div>

          <button onClick={() => window.location.href='/'} className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest text-xs">Return to Store</button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 h-fit text-center">
           <p className="text-white font-bold mb-4">{user?.email}</p>
           <button onClick={signOut} className="text-red-500 font-black text-[10px] uppercase tracking-widest">Sign Out</button>
        </div>
      </div>
    </div>
  );
}
