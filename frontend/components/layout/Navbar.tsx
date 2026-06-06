'use client'

/**
 * Navbar
 *
 * Left  — TACSFON MERCH wordmark → /
 * Right — Theme toggle · Cart badge · Hamburger
 *
 * Drawer is always dark regardless of theme toggle —
 * it's a modal overlay, not a page element.
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname }       from 'next/navigation'
import { createBrowserClient }          from '@supabase/ssr'
import { useCartStore }                 from '@/store/cart'

/* Drawer is intentionally always dark */
const DRAWER_BG      = '#111111'
const DRAWER_SURFACE = '#1A1A1A'
const DRAWER_BORDER  = 'rgba(255,255,255,0.08)'
const DRAWER_TEXT    = '#F5F5F0'
const DRAWER_MUTED   = '#888880'
const ACCENT         = '#3DBA6F'
const DANGER         = '#E05252'
const ADMIN_ACCENT   = '#5B8CFF'

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme,      setTheme]      = useState<'dark' | 'light'>('dark')
  const [user,       setUser]       = useState<any>(null)
  const [isAdmin,    setIsAdmin]    = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const cartCount = useCartStore(s => s.count)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  /* ── Theme ── */
  useEffect(() => {
    const saved = localStorage.getItem('tacsfon-theme') as 'dark' | 'light' | null
    const t = saved ?? 'dark'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('tacsfon-theme', next)
  }

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      const role = data.user?.app_metadata?.role ?? data.user?.user_metadata?.role
      setIsAdmin(role === 'admin')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      const role = session?.user?.app_metadata?.role ?? session?.user?.user_metadata?.role
      setIsAdmin(role === 'admin')
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Close drawer on outside click ── */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node))
        setDrawerOpen(false)
    }
    if (drawerOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [drawerOpen])

  /* ── Close drawer on route change ── */
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setDrawerOpen(false)
    router.push('/')
    router.refresh()
  }

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  /* ── Drawer nav link — always dark colours ── */
  function DrawerLink({
    href, children, accent = false, danger = false,
  }: {
    href: string; children: React.ReactNode; accent?: boolean; danger?: boolean
  }) {
    const active = isActive(href)
    const color  = danger ? DANGER : accent ? ACCENT : active ? DRAWER_TEXT : DRAWER_MUTED
    return (
      <a
        href={href}
        style={{
          display:        'flex',
          alignItems:     'center',
          padding:        '13px 24px',
          fontFamily:     'var(--font-body)',
          fontSize:       '13px',
          fontWeight:     active ? 700 : 500,
          letterSpacing:  '0.06em',
          textTransform:  'uppercase',
          color,
          textDecoration: 'none',
          borderLeft:     active ? `2px solid ${ACCENT}` : '2px solid transparent',
          background:     active ? `rgba(61,186,111,0.08)` : 'none',
          transition:     'color 150ms',
        }}
        onMouseEnter={e => {
          if (!active && !danger)
            (e.currentTarget as HTMLAnchorElement).style.color = DRAWER_TEXT
        }}
        onMouseLeave={e => {
          if (!active && !danger)
            (e.currentTarget as HTMLAnchorElement).style.color = color
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <>
      {/* ── Top bar — responds to theme ── */}
      <nav style={{
        position:             'fixed',
        top:                  0, left: 0, right: 0,
        zIndex:               100,
        height:               '64px',
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'space-between',
        padding:              '0 20px',
        background:           'color-mix(in srgb, var(--bg-base) 88%, transparent)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom:         '1px solid var(--border)',
      }}>

        {/* Wordmark */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            letterSpacing: '0.12em',
            color:         'var(--text-primary)',
            lineHeight:    1,
          }}>
            TACSFON
          </span>
          <span style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            letterSpacing: '0.12em',
            color:         'var(--accent)',
            lineHeight:    1,
            marginLeft:    '6px',
          }}>
            MERCH
          </span>
        </a>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Cart */}
          <a
            href="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            style={{
              position: 'relative', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '4px',
                minWidth: '16px', height: '16px',
                background: 'var(--accent)', color: '#0A0A0A',
                fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '99px', padding: '0 3px', lineHeight: 1,
              }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(v => !v)}
            aria-label="Open menu" aria-expanded={drawerOpen}
            style={{
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            {drawerOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Backdrop ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 149,
            background: 'rgba(10,10,10,0.7)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Drawer — always dark ── */}
      <div
        ref={drawerRef}
        style={{
          position:      'fixed',
          top: 0, right: 0, bottom: 0,
          zIndex:        150,
          width:         '280px',
          maxWidth:      '85vw',
          background:    DRAWER_BG,       /* always #111111 */
          borderLeft:    `1px solid ${DRAWER_BORDER}`,
          display:       'flex',
          flexDirection: 'column',
          transform:     drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition:    'transform 280ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Drawer header */}
        <div style={{
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: `1px solid ${DRAWER_BORDER}`,
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.2em', color: ACCENT, textTransform: 'uppercase',
          }}>
            MENU
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'none', border: 'none',
              color: DRAWER_MUTED, cursor: 'pointer', padding: '8px', display: 'flex',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <DrawerLink href="/">Home</DrawerLink>
          <DrawerLink href="/products">Products</DrawerLink>
          <DrawerLink href="/about">About</DrawerLink>
          <DrawerLink href="/contact">Contact</DrawerLink>

          <div style={{ height: '1px', background: DRAWER_BORDER, margin: '8px 24px' }} />

          <DrawerLink href="/orders">My Orders</DrawerLink>

          {user ? (
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center',
                width: '100%', padding: '13px 24px',
                fontFamily: 'var(--font-body)', fontSize: '13px',
                fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: DANGER, background: 'none', border: 'none',
                borderLeft: '2px solid transparent',
                cursor: 'pointer', textAlign: 'left', transition: 'color 150ms',
              }}
            >
              Sign Out
            </button>
          ) : (
            <DrawerLink href="/login" accent>Sign In</DrawerLink>
          )}

          {isAdmin && (
            <>
              <div style={{ height: '1px', background: DRAWER_BORDER, margin: '8px 24px' }} />
              <a
                href="/admin"
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '13px 24px',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: ADMIN_ACCENT, textDecoration: 'none',
                  borderLeft: '2px solid transparent',
                }}
              >
                Admin Dashboard
              </a>
            </>
          )}
        </nav>

        {/* Drawer footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${DRAWER_BORDER}`,
          flexShrink: 0,
          background: DRAWER_SURFACE,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.12em', color: DRAWER_MUTED,
          }}>
            TACSFON MERCH · UNIBEN
          </p>
        </div>
      </div>
    </>
  )
}
