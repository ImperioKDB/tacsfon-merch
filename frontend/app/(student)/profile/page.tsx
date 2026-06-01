'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, ShieldCheck, User, LogOut } from 'lucide-react';

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

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#C9A84C]" size={32}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F7F5F0] py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-7xl font-black tracking-tighter uppercase italic mb-12">
            {profile?.full_name?.split(' ')[0] || 'Member'}<span className="text-[#C9A84C]">.</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#13131A] border border-[#2A2A38] p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <ShieldCheck className={isAdmin ? "text-[#C9A84C]" : "text-zinc-500"} size={24}/>
                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Access Authorization</p>
                            <p className="font-bold uppercase tracking-tight text-xl">
                                {isAdmin ? "Administrator" : "Standard Member"}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => window.location.href='/'} className="w-full bg-[#F7F5F0] text-black py-4 font-black uppercase text-xs tracking-widest hover:bg-[#C9A84C] transition-all">
                        Return to Store
                    </button>
                </div>
            </div>

            <div className="bg-[#13131A] border border-[#2A2A38] p-8 flex flex-col justify-between">
                <div className="space-y-2">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Connected As</p>
                    <p className="font-bold truncate text-sm">{user?.email}</p>
                </div>
                <button onClick={signOut} className="mt-8 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                    <LogOut size={14}/> Sign Out of System
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
