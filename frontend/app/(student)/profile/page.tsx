'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, Save, Edit2, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/formatters';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const supabase = createBrowserClient();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data);
          setFormData({ full_name: data.full_name || '', phone: data.phone || '' });
        }
        setLoading(false);
      });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, supabase]);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update(formData).eq('id', user?.id);
    if (error) {
      toast.error("Failed to update profile.");
    } else { 
      toast.success("Profile updated successfully"); 
      setProfile({...profile, ...formData}); 
      setIsEditing(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold"><RefreshCw className="animate-spin" size={32}/></div>;

  return (
    <div className="min-h-screen bg-black py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-2">My Profile<span className="text-gold">.</span></h1>
              <p className="text-zinc-500 font-bold text-xs tracking-[0.2em] uppercase">Manage your details</p>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-gold hover:text-white transition-colors text-xs font-black tracking-widest uppercase">
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Full Name</label>
              {isEditing ? (
                 <input className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none transition-all" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} />
              ) : (
                 <p className="text-white text-lg font-bold border border-transparent p-4 pl-0">{profile?.full_name || '—'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Phone Number</label>
              {isEditing ? (
                 <input type="tel" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none transition-all" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="08100..." />
              ) : (
                 <p className="text-white text-lg font-bold border border-transparent p-4 pl-0">{profile?.phone || '—'}</p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-800">
              <button onClick={handleSave} className="bg-gold text-black px-8 py-3.5 font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 text-xs">
                 <Save size={16}/> Save Changes
              </button>
              <button onClick={() => { setIsEditing(false); setFormData({ full_name: profile?.full_name || '', phone: profile?.phone || '' }); }} className="border border-zinc-700 text-white px-8 py-3.5 font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-xs">
                 Cancel
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-8 h-fit space-y-8 rounded-none">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold flex items-center justify-center text-black font-black text-2xl shrink-0">{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold truncate">{user?.email}</p>
                <p className="text-gold text-[10px] font-black tracking-widest uppercase mt-1">{profile?.role}</p>
              </div>
           </div>
           <div className="space-y-4 pt-6 border-t border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-3"><Calendar size={14} className="text-gold"/> Joined {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</div>
              <div className="flex items-center gap-3"><ShieldCheck size={14} className="text-gold"/> Verification Active</div>
           </div>
        </div>
      </div>
    </div>
  );
}
