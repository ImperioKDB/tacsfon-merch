'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Google "G" icon ───────────────────────────────────────────────────────────
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

// ── OR divider ────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.625rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-text-disabled)',
        }}
      >
        or
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </div>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        background: 'rgba(217,79,79,0.08)',
        borderLeft: '2px solid var(--color-error)',
        padding: '10px 14px',
        fontFamily: 'var(--font-inter)',
        fontSize: '0.8125rem',
        color: 'var(--color-error)',
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LoginForm() {
  const router      = useRouter()
  const params      = useSearchParams()
  const next        = params.get('next') ?? '/'
  const supabase    = createBrowserClient()

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // ── Inline field errors (shown on blur) ────────────────────────────────
  const [touched, setTouched] = useState({ email: false, password: false })
  const fieldErrors = {
    email: touched.email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ? 'Please enter a valid email address.'
      : undefined,
    password: touched.password && password.length < 8
      ? 'Password must be at least 8 characters.'
      : undefined,
  }

  const isFormValid = !fieldErrors.email && !fieldErrors.password && email && password

  // ── Email/password login ────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email before signing in. Check your inbox.')
        } else if (
          authError.message.toLowerCase().includes('invalid login') ||
          authError.message.toLowerCase().includes('invalid credentials')
        ) {
          setError('Incorrect email or password. Please check and try again.')
        } else {
          setError(authError.message)
        }
        return
      }

      router.push(next)
      router.refresh()
    } catch {
      setError('Connection issue. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ────────────────────────────────────────────────────────
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
      // On success, browser redirects — no further code needed here
    } catch {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Header */}
      <h2
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontWeight: 600,
          fontSize: '2rem',
          letterSpacing: '0.02em',
          color: 'var(--color-text-primary)',
          marginBottom: '6px',
        }}
      >
        Sign In
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}
      >
        Returning member? Welcome back.
      </p>

      {/* Error banner */}
      {error && <div style={{ marginBottom: '20px' }}><ErrorBanner message={error} /></div>}

      {/* Form */}
      <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={fieldErrors.email}
          placeholder="you@example.com"
          required
        />

        {/* Password with show/hide */}
        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={fieldErrors.password}
            placeholder="••••••••"
            required
            style={{ paddingRight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '14px',
              bottom: fieldErrors.password ? '28px' : '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-disabled)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              transition: 'color var(--duration-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-disabled)')}
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Forgot password */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
          <Link
            href="/forgot-password"
            className="link-gold"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!isFormValid || googleLoading}
          style={{ width: '100%', marginTop: '4px' }}
        >
          Sign In
        </Button>
      </form>

      <OrDivider />

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          padding: '13px 24px',
          cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
          opacity: loading || googleLoading ? 0.5 : 1,
          fontFamily: 'var(--font-inter)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          transition: 'border-color var(--duration-fast) var(--ease-smooth), color var(--duration-fast)',
        }}
        onMouseEnter={(e) => {
          if (loading || googleLoading) return
          e.currentTarget.style.borderColor = 'var(--color-text-secondary)'
          e.currentTarget.style.color = 'var(--color-text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }}
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* Sign up link */}
      <p
        style={{
          marginTop: '28px',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="link-gold"
          style={{ fontWeight: 500 }}
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}