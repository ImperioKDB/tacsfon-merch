'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCw, Save, Mail, Phone, User, Calendar, Edit2, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/formatters';
import { apiFetch } from '@/lib/api/fetch';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
      return;
    }
    if (user) {
      apiFetch('/auth/profile').then((data: any) => {
        setProfile(data);
        setFormData({ full_name: data.full_name || '', phone: data.phone || '' });
        setLoading(false);
      }).catch(() => {
        toast.error("Failed to load profile. Refresh the page.");
        setLoading(false);
      });
    }
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!formData.full_name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const updated = await apiFetch<any>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <RefreshCw className="animate-spin text-gold mb-4" size={32}/>
      <p className="text-zinc-500 text-[10px] font-bold tracking-[0.3em]">LOADING PROFILE...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white italic uppercase mb-2">My Profile</h1>
            <p className="text-gold font-bold text-xs tracking-[0.2em]">{profile?.role === 'admin' ? 'ADMINISTRATOR' : 'STUDENT MEMBER'}</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="mt-4 md:mt-0 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase bg-zinc-900 px-6 py-3 rounded-lg border border-zinc-800">
              <Edit2 size={16}/> Edit Details
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Identity Card */}
          <div className="col-span-1 bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center text-center space-y-4 rounded-xl h-fit">
            <div className="w-24 h-24 rounded-full bg-gold flex items-center justify-center text-black font-black text-4xl shadow-[0_0_20px_rgba(201,168,76,0.2)]">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{profile?.full_name || 'Member'}</p>
              <p className="text-zinc-500 text-sm mt-1">{profile?.email}</p>
            </div>
            <div className="w-full h-px bg-zinc-800 my-2" />
            <div className="space-y-4 w-full">
              <div className="flex justify-center items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                <Calendar size={14} className="text-gold"/> Joined {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
              </div>
              <div className="flex justify-center items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-gold"/> Verification Active
              </div>
            </div>
          </div>

          {/* Details Form */}
          <div className="col-span-1 lg:col-span-2 space-y-6 bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <User size={18} className="text-gold"/> Personal Information
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Full Name</label>
                {isEditing ? (
                  <input className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-gold outline-none transition-all rounded-lg" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} placeholder="E.g. Abolaji Bright" />
                ) : (
                  <p className="text-white text-base font-medium p-4 border border-zinc-900 bg-black rounded-lg">{profile?.full_name || '—'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Email Address</label>
                <div className="flex items-center gap-3 p-4 border border-zinc-900 bg-black rounded-lg opacity-70 cursor-not-allowed">
                  <Mail size={18} className="text-zinc-500"/>
                  <span className="text-white text-sm">{profile?.email}</span>
                </div>
                {isEditing && <p className="text-zinc-600 text-[10px] font-bold tracking-widest uppercase pt-1">Email records are permanently bound to your account.</p>}
              </div>

              <div className="space-y-2">
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Phone Number</label>
                {isEditing ? (
                  <input className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-gold outline-none transition-all rounded-lg" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="08012345678" />
                ) : (
                  <div className="flex items-center gap-3 p-4 border border-zinc-900 bg-black rounded-lg">
                    <Phone size={18} className="text-gold"/>
                    <span className="text-white text-base font-medium">{profile?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-6 mt-6 border-t border-zinc-900 flex-col sm:flex-row">
                <button onClick={() => { setIsEditing(false); setFormData({ full_name: profile.full_name || '', phone: profile.phone || '' }); }} className="flex-[1] bg-zinc-900 text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all rounded-lg flex items-center justify-center gap-2">
                   <X size={16}/> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-[2] bg-gold text-black py-4 font-black uppercase tracking-widest text-xs hover:bg-white transition-all rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                   {saving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>} 
                   {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
