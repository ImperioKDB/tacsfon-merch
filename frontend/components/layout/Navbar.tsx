'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { usePathname }         from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react'
import { useCartStore }        from '@/store/cart'
import { useAuth }             from '@/hooks/useAuth'
import NotificationBell        from '@/components/notifications/NotificationBell'

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/products', label: 'Products' },
  { href: '/about',    label: 'About'    },
  { href: '/contact',  label: 'Contact'  },
]

export default function Navbar() {
  const pathname   = usePathname()
  const cartCount  = useCartStore(s => s.count)
  const { user }   = useAuth()
  const [open,      setOpen]      = useState(false)
  const [scrolled,  setScrolled]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        style={{
          position:    'fixed',
          top:         0,
          left:        0,
          right:       0,
          zIndex:      100,
          height:      '64px',
          display:     'flex',
          alignItems:  'center',
          padding:     '0 24px',
          background:  scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition:  'background 300ms',
          /* gradient bottom border */
          borderBottom: 'none',
        }}
      >
        {/* Gradient bottom border line */}
        <span style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          height:     '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(61,186,111,0.35) 30%, rgba(61,186,111,0.35) 70%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── Left: nav links (desktop) ── */}
        <nav
          aria-label="Primary navigation"
          style={{
            display:    'flex',
            gap:        '28px',
            flex:       1,
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '12px',
                fontWeight:    600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         isActive(href) ? '#3DBA6F' : 'var(--text-muted)',
                textDecoration:'none',
                transition:    'color 150ms',
                paddingBottom: '2px',
                borderBottom:  isActive(href) ? '1px solid #3DBA6F' : '1px solid transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Centre: Logo ── */}
        <Link
          href="/"
          aria-label="TACSFON Merch home"
          style={{
            position:      'absolute',
            left:          '50%',
            transform:     'translateX(-50%)',
            fontFamily:    'var(--font-display)',
            fontSize:      '22px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
            textDecoration:'none',
            whiteSpace:    'nowrap',
            lineHeight:    1,
          }}
        >
          TACSFON
          <span style={{ color: '#3DBA6F', marginLeft: '2px' }}>•</span>
        </Link>

        {/* ── Right: icons ── */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '4px',
            flex:       1,
            justifyContent: 'flex-end',
          }}
        >
          {/* Search — desktop only for now */}
          <button
            aria-label="Search"
            className="hidden md:flex"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 150ms',
            }}
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          {/* Notifications bell */}
          {user && <NotificationBell />}

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            style={{
              position:       'relative',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '8px',
              color:          'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 150ms',
            }}
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span style={{
                position:       'absolute',
                top:            '4px',
                right:          '4px',
                minWidth:       '16px',
                height:         '16px',
                padding:        '0 3px',
                background:     '#3DBA6F',
                color:          '#0A0A0A',
                borderRadius:   '8px',
                fontSize:       '9px',
                fontFamily:     'var(--font-body)',
                fontWeight:     700,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                lineHeight:     1,
              }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href={user ? '/profile' : '/login'}
            aria-label="Profile"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        '8px',
              color:          'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 150ms',
            }}
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-primary)', padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile full-screen overlay menu ── */}
      <div
        aria-hidden={!open}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     99,
          background: '#0A0A0A',
          display:    'flex',
          flexDirection: 'column',
          justifyContent:'center',
          padding:    '0 40px',
          transform:  open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 320ms cubic-bezier(0.32,0.72,0,1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
        className="md:hidden"
      >
        <nav aria-label="Mobile navigation overlay" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NAV_LINKS.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(36px, 8vw, 56px)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color:         isActive(href) ? '#3DBA6F' : 'var(--text-primary)',
                textDecoration:'none',
                lineHeight:    1.1,
                opacity:       open ? 1 : 0,
                transform:     open ? 'translateX(0)' : 'translateX(40px)',
                transition:    `opacity 320ms ${80 + i * 60}ms, transform 320ms ${80 + i * 60}ms, color 150ms`,
              }}
            >
              {label}
            </Link>
          ))}

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border)',
            margin: '20px 0',
            opacity: open ? 1 : 0,
            transition: `opacity 320ms 380ms`,
          }} />

          {/* Secondary links */}
          {[
            { href: user ? '/profile' : '/login', label: user ? 'My Profile' : 'Sign In' },
            { href: '/orders',                    label: 'My Orders' },
            { href: '/cart',                      label: 'Cart' },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '14px',
                fontWeight:    600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         'var(--text-muted)',
                textDecoration:'none',
                opacity:       open ? 1 : 0,
                transform:     open ? 'translateX(0)' : 'translateX(40px)',
                transition:    `opacity 320ms ${420 + i * 50}ms, transform 320ms ${420 + i * 50}ms`,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
