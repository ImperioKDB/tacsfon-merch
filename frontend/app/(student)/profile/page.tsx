'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBrowserClient } from '@/lib/supabase/browser';
import { RefreshCw, Save, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const supabase = createBrowserClient();

  // Memoized loader to fix the ESLint warning
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFormData({ full_name: data.full_name || '', phone: data.phone || '' });
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Authentication error");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: formData.full_name, 
        phone: formData.phone 
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Update failed: " + error.message);
    } else {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await loadProfile();
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gold">
        <RefreshCw className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-24 px-6 text-white uppercase">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-10">
        <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-black italic tracking-tighter">My Account</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-gold text-xs font-bold border border-gold/30 px-4 py-2 hover:bg-gold hover:text-black transition-all"
          >
            {isEditing ? (
              <span className="flex items-center gap-2"><X size={14}/> Cancel</span>
            ) : (
              <span className="flex items-center gap-2"><Edit2 size={14}/> Edit Profile</span>
            )}
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center bg-zinc-950 p-4 border border-zinc-800">
            <p className="text-zinc-500 text-[10px] font-bold">Account Level</p>
            <p className="text-gold font-bold text-xs tracking-widest">
              {isAdmin ? 'ADMINISTRATOR' : 'STUDENT MEMBER'}
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-[10px] font-bold mb-2">Full Name</p>
            {isEditing ? (
              <input 
                className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-gold outline-none"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            ) : (
              <p className="text-xl font-bold tracking-tight">{profile?.full_name || 'Not set'}</p>
            )}
          </div>

          <div>
            <p className="text-zinc-500 text-[10px] font-bold mb-2">Email Address</p>
            <p className="text-xl font-bold text-zinc-400">{user?.email}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-[10px] font-bold mb-2">Phone Number</p>
            {isEditing ? (
              <input 
                className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-gold outline-none"
                value={formData.phone}
                placeholder="e.g. 08012345678"
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            ) : (
              <p className="text-xl font-bold tracking-tight">{profile?.phone || 'Not provided'}</p>
            )}
          </div>

          {isEditing && (
            <button 
              onClick={handleSave}
              className="w-full bg-gold text-black font-black py-4 mt-6 hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              <Save size={18}/> Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
