'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

export default function SignupForm() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
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
      } else {
        toast.success("Account created successfully! Please sign in.");
        router.push('/login'); // Redirect straight to login
      }
    } catch (err) {
      setError('Connection issue. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl font-bold text-white mb-8 uppercase tracking-tighter italic">Create Account</h2>
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <Input label="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
        <Button type="submit" loading={loading} className="w-full mt-4 py-4">Join the Mission</Button>
      </form>
      <p className="mt-8 text-zinc-500 text-center">Already a member? <Link href="/login" className="text-gold">Sign in</Link></p>
    </div>
  );
}
