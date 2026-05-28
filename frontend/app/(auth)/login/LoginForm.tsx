'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/'
  const supabase = createBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
      } else {
        router.push(next === '/' ? '/profile' : next)
        router.refresh()
      }
    } catch (err) {
      setError('Connection issue. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto">
      <h2 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">Sign In</h2>
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 mb-6 text-sm font-bold">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Email</label>
          <input type="email" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">Password</label>
          <input type="password" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-gold outline-none transition-colors" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        
        <button type="submit" disabled={loading} className="w-full mt-6 bg-gold text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-all flex justify-center items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-zinc-500 text-center font-bold text-xs uppercase tracking-widest">
        Don't have an account? <Link href="/signup" className="text-gold hover:text-white transition-colors">Sign up</Link>
      </p>
    </div>
  )
}
