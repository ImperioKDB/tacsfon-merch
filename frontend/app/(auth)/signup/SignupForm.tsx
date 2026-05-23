'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Google icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.625rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-disabled)' }}>or</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" style={{ background: 'rgba(217,79,79,0.08)', borderLeft: '2px solid var(--color-error)', padding: '10px 14px', fontFamily: 'var(--font-inter)', fontSize: '0.8125rem', color: 'var(--color-error)', lineHeight: 1.5 }}>
      {message}
    </div>
  )
}

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: '' }
  let s = 0
  if (pw.length >= 8)             s++
  if (/[0-9]/.test(pw))           s++
  if (/[A-Z]/.test(pw))           s++
  if (/[^A-Za-z0-9]/.test(pw))   s++
  return { score: s, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][s] }
}

function strengthColor(score: number): string {
  if (score <= 1) return 'var(--color-error)'
  if (score <= 3) return 'var(--color-warning)'
  return 'var(--color-success)'
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label } = getStrength(password)
  if (!password) return null
  const color = strengthColor(score)
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: '2px',
              flex: 1,
              background: i <= score ? color : 'var(--color-border)',
              transition: 'background var(--duration-fast) var(--ease-smooth)',
            }}
          />
        ))}
      </div>
      {label && (
        <p style={{ marginTop: '4px', fontFamily: 'var(--font-inter)', fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
          {label}
        </p>
      )}
    </div>
  )
}

// ── Nigerian phone validation ─────────────────────────────────────────────────
function isValidNigerianPhone(phone: string): boolean {
  return /^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, ''))
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SignupForm() {
  const router   = useRouter()
  const params   = useSearchParams()
  const next     = params.get('next') ?? '/'
  const supabase = createBrowserClient()

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: '',
  })
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error,               setError]               = useState('')
  const [loading,             setLoading]             = useState(false)
  const [googleLoading,       setGoogleLoading]       = useState(false)
  const [emailSent,           setEmailSent]           = useState(false)

  const [touched, setTouched] = useState({
    fullName: false, email: false, password: false, confirmPassword: false, phone: false,
  })

  const fieldErrors: Record<string, string | undefined> = {
    fullName: touched.fullName && (form.fullName.trim().length < 2 || form.fullName.trim().length > 100)
      ? 'Full name must be between 2 and 100 characters.'
      : undefined,
    email: touched.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ? 'Please enter a valid email address.'
      : undefined,
    password: touched.password && (form.password.length < 8 || !/[0-9]/.test(form.password))
      ? 'Password must be at least 8 characters and include a number.'
      : undefined,
    confirmPassword: touched.confirmPassword && form.confirmPassword !== form.password
      ? 'Passwords do not match.'
      : undefined,
    phone: touched.phone && form.phone && !isValidNigerianPhone(form.phone)
      ? 'Enter a valid Nigerian phone number (e.g. 08012345678).'
      : undefined,
  }

  const isFormValid =
    !Object.values(fieldErrors).some(Boolean) &&
    form.fullName.trim().length >= 2 &&
    form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
    form.password.length >= 8 &&
    /[0-9]/.test(form.password) &&
    form.confirmPassword === form.password

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }
  const handleBlur = (field: keyof typeof form) => () => {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  // ── Signup ────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    // Touch all fields to surface any remaining errors
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true, phone: true })
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered') ||
            authError.message.toLowerCase().includes('already exists')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.session) {
        // Email confirmation disabled — signed in immediately
        router.push(next)
        router.refresh()
      } else {
        // Email confirmation enabled — show check-email state
        setEmailSent(true)
      }
    } catch {
      setError('Connection issue. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (oauthError) {
        setError('Google sign-in failed. Please try again.')
        setGoogleLoading(false)
      }
    } catch {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  // ── Email sent confirmation state ─────────────────────────────────────
  if (emailSent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={24} style={{ color: 'var(--color-success)', flexShrink: 0 }} strokeWidth={1.5} />
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
            Check Your Email
          </h2>
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          We sent a confirmation link to{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{form.email}</strong>.
          Click the link to activate your account.
        </p>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8125rem', color: 'var(--color-text-disabled)', lineHeight: 1.6 }}>
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <button
            onClick={() => setEmailSent(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', fontFamily: 'var(--font-inter)', fontSize: '0.8125rem', padding: 0 }}
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          style={{
            marginTop: '8px',
            display: 'inline-block',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            border: '1px solid var(--color-gold)',
            padding: '12px 24px',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', letterSpacing: '0.02em', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
        Create Account
      </h2>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
        Join the TACSFON community.
      </p>

      {error && <div style={{ marginBottom: '20px' }}><ErrorBanner message={error} /></div>}

      <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange('fullName')}
          onBlur={handleBlur('fullName')}
          error={fieldErrors.fullName}
          placeholder="Adaeze Okonkwo"
          required
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={fieldErrors.email}
          placeholder="you@example.com"
          required
        />

        {/* Password + strength bar */}
        <div>
          <div style={{ position: 'relative' }}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={fieldErrors.password}
              placeholder="Min. 8 chars, include a number"
              required
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: '14px', bottom: fieldErrors.password ? '28px' : '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)', display: 'flex', alignItems: 'center', padding: '2px', transition: 'color var(--duration-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-disabled)')}
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
          <PasswordStrengthBar password={form.password} />
        </div>

        {/* Confirm password */}
        <div style={{ position: 'relative' }}>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            error={fieldErrors.confirmPassword}
            placeholder="Re-enter password"
            required
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            style={{ position: 'absolute', right: '14px', bottom: fieldErrors.confirmPassword ? '28px' : '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)', display: 'flex', alignItems: 'center', padding: '2px', transition: 'color var(--duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-disabled)')}
          >
            {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>

        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          error={fieldErrors.phone}
          placeholder="08012345678"
          hint="Nigerian number — used for order updates only."
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!isFormValid || googleLoading}
          style={{ width: '100%', marginTop: '4px' }}
        >
          Create Account
        </Button>
      </form>

      <OrDivider />

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', border: '1px solid var(--color-border)', padding: '13px 24px', cursor: loading || googleLoading ? 'not-allowed' : 'pointer', opacity: loading || googleLoading ? 0.5 : 1, fontFamily: 'var(--font-inter)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', transition: 'border-color var(--duration-fast), color var(--duration-fast)' }}
        onMouseEnter={(e) => { if (loading || googleLoading) return; e.currentTarget.style.borderColor = 'var(--color-text-secondary)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <p style={{ marginTop: '28px', fontFamily: 'var(--font-inter)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="link-gold" style={{ fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}