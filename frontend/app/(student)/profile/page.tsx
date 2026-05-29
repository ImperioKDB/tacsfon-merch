'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, Save, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getFriendlyError } from '@/lib/utils/errors';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const supabase = createBrowserClient();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data, error }) => {
        if (data) {
          setProfile(data);
          setFormData({ full_name: data.full_name || '', phone: data.phone || '' });
        }
        if (error) toast.error(getFriendlyError(error));
        setLoading(false);
      });
    }
  }, [user, supabase]);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').upsert({ 
        id: user?.id, 
        email: user?.email,
        ...formData 
    }, { onConflict: 'id' });
    
    if (error) {
      toast.error(getFriendlyError(error));
    } else { 
      toast.success("Profile Updated"); 
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" size={32}/></div>;

  return (
    <div className="min-h-screen bg-black py-32 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="border-b border-zinc-800 pb-8">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white mb-2">
                {profile?.full_name?.split(' ')[0] || 'Account'}<span className="text-gold">.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Full Name</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Phone</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          
          <button onClick={handleSave} className="bg-gold text-black px-12 py-4 font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3">
             <Save size={18}/> Commit Changes
          </button>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-8 h-fit space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold flex items-center justify-center text-black font-black text-xl">{user?.email?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-white font-bold truncate">{user?.email}</p>
                <p className="text-gold text-[10px] font-black tracking-widest uppercase">{profile?.role || 'MEMBER'}</p>
              </div>
           </div>
           <button onClick={signOut} className="w-full border border-red-900/50 text-red-500 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">Sign Out</button>
        </div>
      </div>
    </div>
  );
}
