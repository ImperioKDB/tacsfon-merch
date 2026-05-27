'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!authLoading && !user) {
        window.location.href = '/login';
        return;
    }
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data, error }) => {
        if (data) {
          setProfile(data);
          setFormData({ full_name: data.full_name || '', phone: data.phone || '' });
        }
        setLoading(false);
      });
    }
    // Timeout safety: if it takes 10 seconds, stop spinning
    const timeout = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(timeout);
  }, [user, authLoading, supabase]);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update(formData).eq('id', user?.id);
    if (error) toast.error("Sync failed");
    else { toast.success("Profile updated"); setProfile({...profile, ...formData}); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <RefreshCw className="animate-spin text-gold mb-4" size={32}/>
      <p className="text-zinc-500 text-[10px] font-bold tracking-[0.3em]">SYNCHRONIZING...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-24 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">Account Details</h1>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Full Name</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none transition-all" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Phone Number</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none transition-all" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-gold text-black py-4 font-black uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center justify-center gap-2">
             <Save size={16}/> Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
