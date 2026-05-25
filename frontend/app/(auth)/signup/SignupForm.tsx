'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/'
  const supabase = createBrowserClient()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
        setError('Passwords do not match')
        return
    }
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim(), phone: form.phone.trim() || null },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (authError) {
        setError(authError.message)
      } else {
        setEmailSent(true)
      }
    } catch (err) {
      setError('Connection issue. Please check your internet.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Check Your Email</h2>
        <p className="text-text-secondary">We sent a link to {form.email} to activate your account.</p>
        <Link href="/login" className="block text-gold underline">Back to Sign In</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '32px' }}>
        Create Account
      </h2>

      {error && <div style={{ color: 'var(--color-error)', background: 'rgba(217,79,79,0.1)', padding: '12px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Input label="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <Input label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
        <Input label="Phone (optional)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        
        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '10px' }}>Create Account</Button>
      </form>

      <p style={{ marginTop: '28px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--color-gold)' }}>Sign in</Link>
      </p>
    </div>
  )
}
