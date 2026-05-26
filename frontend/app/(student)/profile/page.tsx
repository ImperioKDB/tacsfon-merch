'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, User } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { Profile } from '@/types';

export default function ProfilePage() {
  const supabase = createBrowserClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error) setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    // Immediate Check + Listener
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchProfile(session.user.id);
      else setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" size={30} /></div>;
  if (!profile) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white text-center px-6">
      <User size={48} className="text-zinc-800 mb-4"/>
      <h2 className="text-xl font-bold mb-2 uppercase">Session Expired</h2>
      <p className="text-zinc-500 mb-6">Please log in again to view your profile.</p>
      <button onClick={() => window.location.href='/login'} className="bg-gold text-black px-8 py-2 font-bold uppercase">Sign In</button>
    </div>;

  return (
    <div className="min-h-screen bg-black py-16 px-6 text-white">
      <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 p-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-8 border-b border-zinc-800 pb-4">My Account</h1>
        <div className="space-y-6">
          <div><label className="text-zinc-500 text-xs font-bold uppercase">Name</label><p className="text-lg">{profile.full_name}</p></div>
          <div><label className="text-zinc-500 text-xs font-bold uppercase">Email</label><p className="text-lg">{profile.email}</p></div>
          <div><label className="text-zinc-500 text-xs font-bold uppercase">Phone</label><p className="text-lg">{profile.phone || 'Not provided'}</p></div>
        </div>
      </div>
    </div>
  );
}
