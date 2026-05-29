'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { 
  RefreshCw, Save, Calendar, ShieldCheck, 
  Package, Truck, Bell, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { getFriendlyError } from '@/lib/utils/errors';

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const supabase = createBrowserClient();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data, error }) => {
        if (data) {
          setProfile(data);
          setFormData({ 
            full_name: data.full_name || '', 
            phone: data.phone || '',
            address: data.address || ''
          });
        }
        if (error) toast.error(getFriendlyError(error));
        setLoading(false);
      });
    }
  }, [user, supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('profiles').upsert({ 
        id: user?.id, 
        email: user?.email,
        ...formData 
    }, { onConflict: 'id' });
    
    if (error) {
      toast.error(getFriendlyError(error));
      setIsSaving(false);
    } else { 
      toast.success("Identity Records Updated"); 
      setTimeout(() => window.location.reload(), 800);
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#C9A84C]" size={32}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F7F5F0] py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT COLUMN: IDENTITY HUB */}
        <div className="lg:col-span-4 space-y-8">
          <div className="relative group w-32 h-32 mx-auto lg:mx-0">
             <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A84C] to-[#E8C96A] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
             <div className="relative w-full h-full bg-[#13131A] border-2 border-[#C9A84C] rounded-full flex items-center justify-center text-4xl font-black text-[#C9A84C]">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
             </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">{profile?.full_name || 'TACSFON Member'}</h2>
            <p className="text-[#A09C94] text-sm mt-1">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#C9A84C26] border border-[#C9A84C40] rounded-full">
               <ShieldCheck size={14} className="text-[#C9A84C]"/>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C]">
                 {profile?.role === 'admin' ? 'Authorized Admin' : 'Fellowship Member'}
               </span>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Orders', val: '0', icon: Package },
              { label: 'Alerts', val: '0', icon: Bell },
              { label: 'Legacy', val: '1y', icon: Calendar }
            ].map((stat, i) => (
              <div key={i} className="bg-[#13131A] border border-[#2A2A38] p-4 text-center rounded-none hover:border-[#C9A84C50] transition-colors">
                <stat.icon size={16} className="mx-auto mb-2 text-[#A09C94]"/>
                <p className="text-lg font-black">{stat.val}</p>
                <p className="text-[8px] uppercase tracking-tighter text-[#A09C94]">{stat.label}</p>
              </div>
            ))}
          </div>

          <button onClick={signOut} className="w-full py-4 text-xs font-black uppercase tracking-[0.3em] text-[#D94F4F] border border-[#D94F4F40] hover:bg-[#D94F4F] hover:text-white transition-all">
            System Sign Out
          </button>
        </div>

        {/* RIGHT COLUMN: CORE FORMS */}
        <div className="lg:col-span-8 space-y-12">
          <header className="border-b border-[#2A2A38] pb-6">
             <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                Member<br/><span className="text-[#C9A84C]">Dashboard.</span>
             </h1>
             <p className="text-[#A09C94] text-xs font-bold tracking-[0.4em] uppercase mt-4">Identity & Fulfillment Hub</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#A09C94]">Legal Identity Name</label>
               <input 
                 className="w-full bg-[#13131A] border border-[#2A2A38] p-4 text-white focus:border-[#C9A84C] outline-none transition-all"
                 value={formData.full_name} 
                 onChange={e=>setFormData({...formData, full_name: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#A09C94]">Primary Contact Phone</label>
               <input 
                 className="w-full bg-[#13131A] border border-[#2A2A38] p-4 text-white focus:border-[#C9A84C] outline-none transition-all"
                 value={formData.phone} 
                 onChange={e=>setFormData({...formData, phone: e.target.value})}
               />
            </div>
            <div className="md:col-span-2 space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-[#A09C94]">Default Delivery Coordinates (Address)</label>
               <textarea 
                 rows={3}
                 className="w-full bg-[#13131A] border border-[#2A2A38] p-4 text-white focus:border-[#C9A84C] outline-none transition-all resize-none"
                 value={formData.address} 
                 onChange={e=>setFormData({...formData, address: e.target.value})}
                 placeholder="e.g. Block 4, Room 202, Male Hostel"
               />
            </div>
          </section>

          <div className="flex justify-between items-center pt-6 border-t border-[#2A2A38]">
             <div className="hidden md:block">
               <p className="text-[10px] text-[#A09C94] uppercase tracking-widest">Last change: 2 minutes ago</p>
             </div>
             <button 
               onClick={handleSave} 
               disabled={isSaving}
               className="bg-[#C9A84C] text-[#0A0A0F] px-10 py-4 font-black uppercase tracking-widest hover:bg-[#F7F5F0] transition-all flex items-center gap-3 disabled:opacity-50"
             >
                {isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
                Commit Changes
             </button>
          </div>

          {/* MINI TIMELINE */}
          <section className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A84C]">Active Shipments</h3>
             <div className="bg-[#13131A] border border-[#2A2A38] p-6 flex items-center justify-between group cursor-pointer hover:border-[#C9A84C40]">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-[#2A2A38] flex items-center justify-center rounded-none">
                      <Truck className="text-[#C9A84C]" size={20}/>
                   </div>
                   <div>
                      <p className="font-bold">Order #AC294B</p>
                      <p className="text-xs text-[#A09C94]">Dispatched • Expected Arrival Friday</p>
                   </div>
                </div>
                <ChevronRight className="text-[#2A2A38] group-hover:text-[#C9A84C] transition-colors" size={20}/>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
