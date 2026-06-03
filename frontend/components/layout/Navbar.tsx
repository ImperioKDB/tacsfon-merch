'use client'

/**
 * Navbar — Phase 2 (bug-fix: removed duplicate floating hamburger)
 *
 * Layout:
 *   [Nav links — left]   [TACSFON MERCH — center]   [Icons — right]
 *
 * The mobile hamburger lives ONLY in the right icon cluster.
 * There is NO separate fixed/floating hamburger button anywhere.
 *
 * Mobile overlay: full-screen, z-index 200, opened by the single hamburger.
 * Inline CSS only — no Tailwind utility classes.
 */

import Link                       from 'next/link'
import { usePathname }            from 'next/navigation'
import { useState, useEffect }    from 'react'
import { ShoppingBag, User, X, Menu } from 'lucide-react'
import { useCartStore }           from '@/store/cart'
import ThemeToggle                from './ThemeToggle'

const NAV_LINKS = [
  { href: '/products',  label: 'Products'  },
  { href: '/about',     label: 'About'     },
  { href: '/contact',   label: 'Contact'   },
]

export default function Navbar() {
  const pathname     = usePathname()
  const cartCount    = useCartStore(s => s.count)
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav
        style={{
          position:       'fixed',
          top:            0,
          left:           0,
          right:          0,
          zIndex:         100,
          height:         '64px',
          display:        'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems:     'center',
          paddingLeft:    '24px',
          paddingRight:   '24px',
          background:     'color-mix(in srgb, var(--bg-base) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom:   '1px solid var(--border)',
        }}
      >
        {/* Left: desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-desktop-link"
              style={{
                display:       'none',
                fontFamily:    'var(--font-body)',
                fontSize:      '12px',
                fontWeight:    600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color:         isActive(link.href) ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration:'none',
                transition:    'color 150ms',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center: logo */}
        <Link
          href="/"
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            letterSpacing: '0.12em',
            color:         'var(--text-primary)',
            textDecoration:'none',
            whiteSpace:    'nowrap',
            textAlign:     'center',
          }}
        >
          TACSFON{' '}
          <span style={{ color: 'var(--accent)' }}>MERCH</span>
        </Link>

        {/* Right: icons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <ThemeToggle />

          <Link
            href="/cart"
            aria-label="Cart"
            style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', minWidth: '16px', height: '16px', borderRadius: '8px', background: 'var(--accent)', color: '#0A0A0A', fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            aria-label="Profile"
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', textDecoration: 'none' }}
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          {/* Single hamburger — mobile only */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="nav-hamburger"
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        aria-hidden={!open}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         200,
          background:     'var(--bg-base)',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '40px',
          opacity:        open ? 1 : 0,
          pointerEvents:  open ? 'auto' : 'none',
          transition:     'opacity 250ms ease',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          style={{ position: 'absolute', top: '16px', right: '20px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        {NAV_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(36px, 10vw, 56px)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color:         isActive(link.href) ? 'var(--accent)' : 'var(--text-primary)',
              textDecoration:'none',
              opacity:       open ? 1 : 0,
              transform:     open ? 'translateY(0)' : 'translateY(16px)',
              transition:    `opacity 300ms ease ${i * 60 + 80}ms, transform 300ms ease ${i * 60 + 80}ms`,
            }}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          <Link href="/cart" onClick={() => setOpen(false)} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>
            <ShoppingBag size={18} strokeWidth={1.5} /> Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          <Link href="/profile" onClick={() => setOpen(false)} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>
            <User size={18} strokeWidth={1.5} /> Profile
          </Link>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .nav-desktop-link { display: block !important; }
          .nav-hamburger    { display: none  !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop-link { display: none  !important; }
          .nav-hamburger    { display: flex  !important; }
        }
      `}</style>
    </>
  )
}
