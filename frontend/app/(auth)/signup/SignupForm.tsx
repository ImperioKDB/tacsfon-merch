'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupForm() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim(), phone: form.phone.trim() || null },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        toast.success("Account created successfully! Please sign in.");
        router.push('/login');
      }
    } catch (err: any) {
      setError('Connection issue. Please check your internet.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto">
      <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">Create Account</h2>
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 mb-6 text-sm font-bold">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Full Name</label>
          <input className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
        </div>
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Email</label>
          <input type="email" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Phone (Optional)</label>
          <input type="tel" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Password</label>
          <input type="password" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
        </div>
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Confirm Password</label>
          <input type="password" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required minLength={8} />
        </div>
        
        <button type="submit" disabled={loading} className="w-full mt-6 bg-gold text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-all flex justify-center items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Join the Mission"}
        </button>
      </form>
      <p className="mt-8 text-zinc-500 text-center font-bold text-xs uppercase tracking-widest">
        Already a member? <Link href="/login" className="text-gold hover:text-white transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
