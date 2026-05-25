import { useState }                    from 'react'
import { useRouter, useSearchParams }  from 'next/navigation'
import Link                             from 'next/link'
import { toast }                        from 'sonner'
import { createBrowserClient }          from '@/lib/supabase/browser'
import Input                            from '@/components/ui/Input'
import Button                           from '@/components/ui/Button'

export default function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/'

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const supabase = createBrowserClient()

  // ── Email / password login ────────────────────────────────────────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error(error.message); return }
      router.push(next)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  // FIX: always pass redirectTo so Google sends the user to /auth/callback,
  //      not the Site URL (home page). Without this the PKCE code verifier
  //      stored in cookies is never consumed → "bad_code_verifier" error.
  async function handleGoogleLogin() {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) {
        toast.error(error.message)
        setGoogleLoading(false)
      }
      // On success the browser navigates away — no need to setGoogleLoading(false)
    } catch {
      toast.error('Something went wrong. Please try again.')
      setGoogleLoading(false)
    }
  }

  const error = searchParams.get('error')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Title */}
      <div>
        <h1 style={{
          fontFamily:    'var(--font-cormorant)',
          fontSize:      'clamp(1.75rem, 4vw, 2.25rem)',
          fontWeight:    600,
          color:         'var(--color-text-primary)',
          marginBottom:  '6px',
          letterSpacing: '0.01em',
        }}>
          Welcome Back
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)' }}>
          Sign in to your TACSFON Merch account.
        </p>
      </div>

      {/* Auth error banner (e.g. ?error=auth_failed from callback) */}
      {error && (
        <div style={{
          padding:      '10px 14px',
          background:   'rgba(217,79,79,0.10)',
          border:       '1px solid rgba(217,79,79,0.30)',
          color:        'var(--color-error)',
          fontSize:     '0.8125rem',
          fontFamily:   'var(--font-inter)',
        }}>
          Sign-in failed. Please try again.
        </div>
      )}

      {/* Google sign-in button */}
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '10px',
          width:          '100%',
          padding:        '13px 20px',
          background:     'transparent',
          border:         '1px solid var(--color-border)',
          color:          'var(--color-text-primary)',
          fontFamily:     'var(--font-inter)',
          fontSize:       '0.8125rem',
          fontWeight:     500,
          cursor:         googleLoading ? 'not-allowed' : 'pointer',
          opacity:        googleLoading ? 0.6 : 1,
          transition:     'border-color 150ms, background 150ms',
        }}
        onMouseEnter={e => {
          if (!googleLoading)
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-gold)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
        }}
      >
        {/* Google "G" SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
        </svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-disabled)', fontFamily: 'var(--font-inter)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          or
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>

      {/* Email / password form */}
      <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: '4px' }}>
          Sign In
        </Button>
      </form>

      {/* Footer links */}
      <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)' }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 500 }}>
          Create one
        </Link>
      </p>
    </div>
  )
}