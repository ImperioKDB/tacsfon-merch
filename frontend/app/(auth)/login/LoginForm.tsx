'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginForm() {
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
        setLoading(false)
        return
      }

      if (data.user) {
        toast.success("Identity Confirmed")
        // Immediate redirect to Profile - let profile page handle the sync
        window.location.href = '/profile'
      }
    } catch (err) {
      toast.error("Network delay detected. Retrying...")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto p-6 bg-zinc-900/50 border border-zinc-800">
      <h2 className="text-4xl font-black text-white mb-8 uppercase italic tracking-tighter">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" placeholder="EMAIL" className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-gold outline-none font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="PASSWORD" className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-gold outline-none font-bold" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-gold text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-all">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Access System"}
        </button>
      </form>
    </div>
  )
}
