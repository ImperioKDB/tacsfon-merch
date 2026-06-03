'use client'

/**
 * LoginForm
 *
 * Phase 9 — TACSFON Merch editorial streetwear auth.
 * Email + password only. No OAuth.
 *
 * Layout:
 *   Desktop: split-screen — left brand panel, right form.
 *   Mobile:  short brand strip at top, form scrolls below.
 */

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginForm() {
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    display:      'block',
    width:        '100%',
    boxSizing:    'border-box',
    padding:      '14px 16px',
    background:   'var(--bg-elevated)',
    border:       '1px solid var(--border)',
    color:        'var(--text-primary)',
    fontFamily:   'var(--font-body)',
    fontSize:     '14px',
    outline:      'none',
    borderRadius: 0,
    transition:   'border-color 0.2s ease',
  }

  const labelStyle: React.CSSProperties = {
    display:       'block',
    fontFamily:    'var(--font-body)',
    fontSize:      '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color:         'var(--text-muted)',
    marginBottom:  '6px',
  }

  return (
    <div style={{
      display:       'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight:     '100dvh',
      background:    'var(--bg-base)',
    }}>

      {/* ── Brand panel ── */}
      <div style={{
        flex:           isMobile ? 'none' : 1,
        background:     'linear-gradient(160deg, #0A0A0A 0%, #111008 60%, #1a1505 100%)',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: isMobile ? 'center' : 'flex-end',
        padding:        isMobile ? '40px 24px' : '64px 56px',
        position:       'relative',
        overflow:       'hidden',
        minHeight:      isMobile ? '200px' : undefined,
      }}>
        {/* Decorative grid */}
        <div style={{
          position:      'absolute',
          inset:         0,
          background:    `
            repeating-linear-gradient(0deg, transparent, transparent 79px,
              rgba(201,168,76,0.04) 79px, rgba(201,168,76,0.04) 80px),
            repeating-linear-gradient(90deg, transparent, transparent 79px,
              rgba(201,168,76,0.04) 79px, rgba(201,168,76,0.04) 80px)
          `,
          pointerEvents: 'none',
        }} />
        {/* Corner accent */}
        <div style={{
          position:      'absolute',
          top: 0, left: 0,
          width:         '120px',
          height:        '120px',
          borderRight:   '1px solid rgba(201,168,76,0.2)',
          borderBottom:  '1px solid rgba(201,168,76,0.2)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            margin:        '0 0 24px',
            fontFamily:    'var(--font-mono)',
            fontSize:      '11px',
            color:         'var(--accent)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}>
            TACSFON MERCH
          </p>
          <h2 style={{
            margin:        0,
            fontFamily:    'var(--font-display)',
            fontSize:      isMobile ? '40px' : 'clamp(48px, 5vw, 72px)',
            lineHeight:    0.9,
            letterSpacing: '0.03em',
            color:         'var(--text-primary)',
          }}>
            WEAR<br />THE<br />
            <span style={{ color: 'var(--accent)' }}>CULTURE.</span>
          </h2>
          {!isMobile && (
            <p style={{
              margin:     '24px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize:   '13px',
              color:      'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth:   '280px',
            }}>
              Official merchandise of the Technical and Applied Science
              Faculty Organisation of Nigeria, University of Benin.
            </p>
          )}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div style={{
        flex:           isMobile ? 'none' : 1,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        isMobile ? '40px 24px 64px' : '64px 56px',
        background:     'var(--bg-base)',
      }}>
        <div style={{ maxWidth: '380px', width: '100%', margin: isMobile ? '0 auto' : '0' }}>

          <h1 style={{
            margin:        '0 0 4px',
            fontFamily:    'var(--font-display)',
            fontSize:      '32px',
            letterSpacing: '0.08em',
            color:         'var(--text-primary)',
          }}>
            SIGN IN
          </h1>
          <p style={{
            margin:     '0 0 36px',
            fontFamily: 'var(--font-body)',
            fontSize:   '13px',
            color:      'var(--text-muted)',
          }}>
            Welcome back. Enter your details below.
          </p>

          {error && (
            <div style={{
              padding:      '12px 16px',
              background:   'rgba(224,82,82,0.08)',
              border:       '1px solid rgba(224,82,82,0.25)',
              color:        'var(--danger)',
              fontFamily:   'var(--font-body)',
              fontSize:     '12px',
              marginBottom: '24px',
              lineHeight:   1.5,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop:     '8px',
                width:         '100%',
                minHeight:     '52px',
                background:    loading ? 'var(--bg-elevated)' : 'var(--accent)',
                border:        'none',
                color:         loading ? 'var(--text-muted)' : '#0A0A0A',
                fontFamily:    'var(--font-body)',
                fontSize:      '13px',
                fontWeight:    700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor:        loading ? 'not-allowed' : 'pointer',
                transition:    'background 0.2s ease',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = 'var(--accent-hover)') }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = 'var(--accent)') }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{
            marginTop:  '28px',
            fontFamily: 'var(--font-body)',
            fontSize:   '13px',
            color:      'var(--text-muted)',
            textAlign:  'center',
          }}>
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent)')}
            >
              Sign up
            </a>
          </p>

        </div>
      </div>
    </div>
  )
}
