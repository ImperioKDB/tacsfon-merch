'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { usePathname }         from 'next/navigation'
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react'
import { useCartStore }        from '@/store/cart'
import { useAuth }             from '@/hooks/useAuth'
import ThemeToggle             from './ThemeToggle'

export default function Navbar() {
  const pathname    = usePathname()
  const { user }    = useAuth()
  const cartCount   = useCartStore((s) => s.count)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [scrolled,  setScrolled]  = useState(false)

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { href: '/products',  label: 'Shop'    },
    { href: '/about',     label: 'About'   },
    { href: '/contact',   label: 'Contact' },
  ]

  return (
    <>
      {/* ── Spacer so page content doesn't sit under fixed navbar ── */}
      <div style={{ height: '64px' }} aria-hidden="true" />

      {/* ── Navbar ── */}
      <header
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          right:           0,
          zIndex:          30,
          height:          '64px',
          display:         'flex',
          alignItems:      'center',
          background:      scrolled
            ? 'color-mix(in srgb, var(--bg-base) 92%, transparent)'
            : 'color-mix(in srgb, var(--bg-base) 80%, transparent)',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom:    scrolled
            ? '1px solid var(--border)'
            : '1px solid transparent',
          transition:      'border-color 200ms ease, background 200ms ease',
          padding:         '0 24px',
        }}
      >
        {/* Left — desktop nav links */}
        <nav
          aria-label="Main navigation"
          style={{
            flex:       1,
            display:    'flex',
            alignItems: 'center',
            gap:        '32px',
          }}
          className="desktop-nav"
        >
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily:    'var(--font-body)',
                  fontSize:      '12px',
                  fontWeight:    600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color:         active ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  transition:    'color 150ms ease',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Centre — logo */}
        <Link
          href="/"
          aria-label="TACSFON Merch — Home"
          style={{
            position:      'absolute',
            left:          '50%',
            transform:     'translateX(-50%)',
            fontFamily:    'var(--font-display)',
            fontSize:      '22px',
            letterSpacing: '0.14em',
            color:         'var(--text-primary)',
            textDecoration: 'none',
            whiteSpace:    'nowrap',
            userSelect:    'none',
          }}
        >
          TACSFON
          <span style={{ color: 'var(--accent)' }}> MERCH</span>
        </Link>

        {/* Right — icons */}
        <div
          style={{
            flex:           1,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'flex-end',
            gap:            '4px',
          }}
        >
          {/* Search */}
          <Link
            href="/products"
            aria-label="Search products"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '44px',
              height:         '44px',
              color:          'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 150ms ease',
            }}
            className="nav-icon-link"
          >
            <Search size={16} strokeWidth={1.75} />
          </Link>

          {/* Theme toggle — Sun / Moon */}
          <ThemeToggle />

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Cart${cartCount ? ` — ${cartCount} items` : ''}`}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              position:       'relative',
              width:          '44px',
              height:         '44px',
              color:          'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 150ms ease',
            }}
            className="nav-icon-link"
          >
            <ShoppingBag size={16} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position:      'absolute',
                  top:           '8px',
                  right:         '6px',
                  width:         '16px',
                  height:        '16px',
                  borderRadius:  '50%',
                  background:    'var(--accent)',
                  color:         '#000',
                  fontFamily:    'var(--font-body)',
                  fontSize:      '10px',
                  fontWeight:    700,
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  lineHeight:    1,
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href={user ? '/profile' : '/login'}
            aria-label={user ? 'My profile' : 'Sign in'}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '44px',
              height:         '44px',
              color:          user ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 150ms ease',
            }}
            className="nav-icon-link"
          >
            <User size={16} strokeWidth={1.75} />
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="hamburger"
            style={{
              display:        'none',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '44px',
              height:         '44px',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              color:          'var(--text-primary)',
            }}
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ── */}
      <div
        aria-hidden={!menuOpen}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     40,
          background: 'var(--bg-base)',
          display:    'flex',
          flexDirection: 'column',
          padding:    '24px',
          transform:  menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      'var(--text-primary)',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width:      '44px',
              height:     '44px',
            }}
          >
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        {/* Links */}
        <nav aria-label="Mobile navigation" style={{ flex: 1 }}>
          {[...navLinks, ...(user
            ? [{ href: '/orders', label: 'My Orders' }, { href: '/profile', label: 'Profile' }]
            : [{ href: '/login', label: 'Sign In' }, { href: '/signup', label: 'Join Us' }]
          )].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              style={{
                display:       'block',
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(40px, 10vw, 64px)',
                letterSpacing: '0.04em',
                color:         pathname === href ? 'var(--accent)' : 'var(--text-primary)',
                textDecoration:'none',
                lineHeight:    1.1,
                marginBottom:  '16px',
                animation:     menuOpen ? `fade-in 300ms ${i * 60}ms ease both` : 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom row — theme toggle in mobile menu too */}
        <div
          style={{
            borderTop:   '1px solid var(--border)',
            paddingTop:  '24px',
            display:     'flex',
            alignItems:  'center',
            gap:         '16px',
          }}
        >
          <ThemeToggle />
          <span
            style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '12px',
              color:         'var(--text-muted)',
              letterSpacing: '0.08em',
            }}
          >
            Toggle theme
          </span>
        </div>
      </div>

      <style>{`
        .nav-icon-link:hover { color: var(--accent) !important; }

        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
      `}</style>
    </>
  )
}
