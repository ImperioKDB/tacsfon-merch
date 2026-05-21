'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { createBrowserClient } from '@/lib/supabase/browser'
import NotificationBell from '@/components/notifications/NotificationBell'
import type { Session } from '@supabase/supabase-js'

const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/contact' },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function CountBadge({ count, color = 'var(--color-gold)' }: { count: number; color?: string }) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '-6px',
        right: '-8px',
        background: color,
        color: color === 'var(--color-gold)' ? '#0A0A0F' : '#fff',
        fontSize: '0.5625rem',
        fontFamily: 'var(--font-inter)',
        fontWeight: 700,
        minWidth: '16px',
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 3px',
        letterSpacing: '0',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Navbar() {
  const supabase = createBrowserClient()
  const [scrolled, setScrolled]     = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [session, setSession]       = useState<Session | null>(null)
  const cartCount   = useCartStore((s) => s.count)
  const observerRef = useRef<IntersectionObserver | null>(null)
  

  // ── Auth state ─────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Scroll detection via IntersectionObserver on #hero ─────────────────
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) { setScrolled(true); return }

    observerRef.current = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.05 },
    )
    observerRef.current.observe(hero)
    return () => observerRef.current?.disconnect()
  }, [])

  // ── Lock body scroll when mobile drawer is open ─────────────────────────
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDrawerOpen(false)
  }

  const iconStyle: React.CSSProperties = {
    position: 'relative',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'color var(--duration-fast) var(--ease-smooth)',
  }

  return (
    <>
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          background: scrolled ? 'var(--color-surface)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          transition: [
            'background var(--duration-base) var(--ease-smooth)',
            'border-color var(--duration-base) var(--ease-smooth)',
          ].join(', '),
        }}
        role="banner"
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" aria-label="TACSFON Merch home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 700,
                fontSize: '1.1875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-primary)',
              }}
            >
              TACSFON Merch
            </span>
            <span
              aria-hidden="true"
              style={{
                width: '5px',
                height: '5px',
                background: 'var(--color-gold)',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" style={{ display: 'flex', gap: '40px' }} className="hidden md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Cart */}
            <Link href="/cart" style={iconStyle} aria-label={`Cart, ${cartCount} items`}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              <CountBadge count={cartCount} />
            </Link>

            {/* Notification Bell — only when signed in */}
            {session && <NotificationBell />}

            {/* Auth */}
            {session ? (
              <Link href="/profile" style={iconStyle} aria-label="Profile">
                <User size={20} strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-block"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  border: '1px solid var(--color-gold)',
                  padding: '9px 18px',
                  textDecoration: 'none',
                  transition: 'background var(--duration-fast) var(--ease-smooth)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gold-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              className="flex md:hidden"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {drawerOpen
                ? <X size={20} strokeWidth={1.5} />
                : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} role="dialog" aria-modal="true" aria-label="Mobile navigation">
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Slide-in panel */}
          <nav
            style={{
              position: 'absolute',
              top: 0, right: 0, bottom: 0,
              width: '280px',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              padding: '88px 32px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'block',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth action at bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
              {session ? (
                <button
                  onClick={handleSignOut}
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-error)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    textDecoration: 'none',
                    display: 'inline-block',
                    border: '1px solid var(--color-gold)',
                    padding: '10px 20px',
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}