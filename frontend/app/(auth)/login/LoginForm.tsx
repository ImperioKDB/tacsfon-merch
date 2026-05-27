'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

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
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError(authError.message)
      } else {
        
        window.location.href = next === '/' ? '/profile' : next
      }
    } catch (err) {
      setError('Connection issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '32px' }}>
        Sign In
      </h2>

      {error && <div style={{ color: 'var(--color-error)', background: 'rgba(217,79,79,0.1)', padding: '12px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '10px' }}>Sign In</Button>
      </form>

      <p style={{ marginTop: '28px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Don't have an account? <Link href="/signup" style={{ color: 'var(--color-gold)' }}>Sign up</Link>
      </p>
    </div>
  )
}
