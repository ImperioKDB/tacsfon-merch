'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api/fetch';
import { formatDate } from '@/lib/utils/formatters';
import { User, Mail, Phone, Calendar, ShoppingBag, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, oData] = await Promise.all([
          apiFetch('/auth/session'),
          apiFetch('/orders')
        ]);
        setProfile(pData);
        setOrderCount(Array.isArray(oData) ? oData.length : 0);
        setEditForm({ full_name: pData.full_name || '', phone: pData.phone || '' });
      } catch (err) {
        toast.error("Could not load profile details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdate = async () => {
    try {
      await apiFetch('/auth/session', { // Assuming your backend has a PATCH/PUT for profiles
        method: 'PATCH',
        body: JSON.stringify(editForm)
      });
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed.");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold uppercase tracking-widest">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-black py-20 px-6 text-white">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tighter uppercase">My Profile</h1>
          <button onClick={() => setIsEditing(!isEditing)} className="text-gold flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            {isEditing ? <><X size={16}/> Cancel</> : <><Edit2 size={16}/> Edit Details</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-black font-bold text-xl uppercase">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                {isEditing ? (
                  <input className="bg-black border border-zinc-700 p-1 text-white outline-none focus:border-gold" 
                         value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
                ) : (
                  <p className="text-xl font-bold">{profile?.full_name}</p>
                )}
                <p className="text-zinc-500 text-sm">Role: <span className="text-gold uppercase text-xs">{profile?.role}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-400">
                <Mail size={18}/> <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <Phone size={18}/> 
                {isEditing ? (
                  <input className="bg-black border border-zinc-700 p-1 text-white outline-none focus:border-gold" 
                         value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                ) : (
                  <span>{profile?.phone || 'No phone added'}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <Calendar size={18}/> <span>Joined {formatDate(profile?.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 border border-zinc-800 flex flex-col justify-center items-center text-center">
            <ShoppingBag size={40} className="text-gold mb-2" />
            <p className="text-4xl font-black text-white">{orderCount}</p>
            <p className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Total Orders</p>
          </div>
        </div>

        {isEditing && (
          <button onClick={handleUpdate} className="w-full bg-gold text-black font-bold uppercase py-4 mt-8 tracking-widest hover:bg-white transition-all">
            Save Changes
          </button>
        )}

        <button onClick={signOut} className="w-full border border-red-900/30 text-red-500 font-bold uppercase py-4 mt-10 tracking-widest hover:bg-red-500 hover:text-white transition-all">
          Sign Out
        </button>
      </div>
    </div>
  );
}
