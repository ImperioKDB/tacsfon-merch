'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Lock, Save, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { formatDate } from '@/lib/utils/formatters';
import type { Profile } from '@/types';

export default function ProfilePage() {
  const supabase = createBrowserClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const loadProfile = async () => {
    setLoadingProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoadingProfile(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
      setFullName(data.full_name ?? '');
      setPhone(data.phone ?? '');
    }
    setLoadingProfile(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq('id', profile.id);
      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, full_name: fullName.trim(), phone: phone.trim() || null } : prev);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <RefreshCw className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <User size={48} className="text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Initialized</h2>
        <p className="text-zinc-400 max-w-xs mb-6">We couldn't find your profile record in the database.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gold text-black px-6 py-2 font-bold uppercase tracking-widest text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 p-8">
            <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4 uppercase tracking-tighter">My Account</h1>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-zinc-500 text-xs uppercase font-bold mb-2">Full Name</label>
                    <input 
                        className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-zinc-500 text-xs uppercase font-bold mb-2">Email Address</label>
                    <input className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-500 outline-none" value={profile.email} disabled />
                </div>
                <div>
                    <label className="block text-zinc-500 text-xs uppercase font-bold mb-2">Phone Number</label>
                    <input 
                        className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors"
                        value={phone}
                        placeholder="080..."
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full bg-gold text-black py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                >
                    {savingProfile ? 'Saving...' : 'Update Profile'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
