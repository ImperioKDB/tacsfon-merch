'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, Save, User, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'WAITING...';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const supabase = createBrowserClient();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        // Automatically fetch from user metadata if their profile is empty/missing
        setProfile(data || null);
        setFormData({ 
          full_name: data?.full_name || user?.user_metadata?.full_name || '', 
          phone: data?.phone || user?.phone || user?.user_metadata?.phone || '' 
        });
        setLoading(false);
      });
    }
  }, [user, supabase]);

  const handleSave = async () => {
    // CRITICAL FIX: Use 'upsert' instead of update. This creates the profile if it doesn't exist yet!
    const payload = { id: user?.id, ...formData, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    
    if (error) {
      console.error("Profile saving error:", error);
      toast.error("Deficiency detected: Update failed");
    } else { 
      toast.success("System updated: Profile synchronized"); 
      setProfile({...profile, ...formData}); 
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" size={32}/></div>;

  return (
    <div className="min-h-screen bg-black py-32 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="border-b border-zinc-800 pb-8">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white mb-2">Member<span className="text-gold">.</span></h1>
            <p className="text-zinc-500 font-bold text-xs tracking-[0.3em]">SECURE ACCESS AUTHORIZED</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Full Legal Name</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold transition-all" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} placeholder="Abolaji Bright" />
            </div>
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Direct Contact (Mobile)</label>
              <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold transition-all" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="07045934864" />
            </div>
          </div>
          
          <button onClick={handleSave} className="bg-gold text-black px-12 py-4 font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3">
             <Save size={18}/> Commit Changes
          </button>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-8 h-fit space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold flex items-center justify-center text-black font-black text-xl">{user?.email?.charAt(0).toUpperCase()}</div>
              <div><p className="text-white font-bold">{user?.email}</p><p className="text-gold text-[10px] font-black tracking-widest uppercase">{profile?.role || 'MEMBER'}</p></div>
           </div>
           <div className="space-y-4 pt-4 border-t border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-3"><Calendar size={16} className="text-gold"/> Joined {formatDate(user?.created_at || profile?.created_at)}</div>
              <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-gold"/> Verified Identity</div>
           </div>
        </div>
      </div>
    </div>
  );
}
