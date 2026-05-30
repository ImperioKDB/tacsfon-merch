'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/profile'
  const supabase = createBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Identity Confirmed");
        // Use a hard redirect to ensure Navbar and Middleware see the fresh session
        window.location.href = next; 
      }
    } catch (err) {
      toast.error("Connection unstable. Please try again.");
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto animate-fadeIn">
      <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">Sign In</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" placeholder="EMAIL" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="PASSWORD" className="w-full bg-zinc-950 border border-zinc-800 p-4 text-white focus:border-gold outline-none font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-gold text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-all flex justify-center items-center">
          {loading ? <Loader2 className="animate-spin" /> : "Access System"}
        </button>
      </form>
      <p className="mt-8 text-zinc-500 text-center font-bold text-xs uppercase">
        Don't have an account? <Link href="/signup" className="text-gold hover:underline">Join the mission</Link>
      </p>
    </div>
  )
}
