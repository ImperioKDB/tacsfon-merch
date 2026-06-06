'use client'

/**
 * BottomNav
 * 5-tab mobile nav bar.
 * Uses CSS vars so it responds to the theme toggle.
 */

import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cart'

const TABS = [
  {
    href:  '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href:  '/products',
    label: 'Products',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    href:  '/cart',
    label: 'Cart',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    href:  '/orders',
    label: 'Orders',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    href:  '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname  = usePathname()
  const cartCount = useCartStore(s => s.count)

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        style={{
          position:        'fixed',
          bottom:          0,
          left:            0,
          right:           0,
          zIndex:          90,
          height:          '60px',
          display:         'flex',
          alignItems:      'stretch',
          background:      'var(--bg-surface)',
          borderTop:       '1px solid var(--border)',
        }}
        className="bottom-nav"
      >
        {TABS.map(tab => {
          const active = isActive(tab.href)
          const isCart = tab.href === '/cart'
          return (
            <a
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              style={{
                flex:           1,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '3px',
                textDecoration: 'none',
                color:          active ? 'var(--accent)' : 'var(--text-muted)',
                position:       'relative',
                transition:     'color 150ms ease',
              }}
            >
              {/* Active indicator */}
              {active && (
                <span style={{
                  position:     'absolute',
                  top:          0,
                  left:         '50%',
                  transform:    'translateX(-50%)',
                  width:        '24px',
                  height:       '2px',
                  background:   'var(--accent)',
                  borderRadius: '0 0 2px 2px',
                }} />
              )}

              {/* Cart badge */}
              <span style={{ position: 'relative', display: 'flex' }}>
                {tab.icon(active)}
                {isCart && cartCount > 0 && (
                  <span style={{
                    position:        'absolute',
                    top:             '-4px',
                    right:           '-6px',
                    minWidth:        '16px',
                    height:          '16px',
                    background:      'var(--accent)',
                    color:           '#0A0A0A',
                    fontFamily:      'var(--font-body)',
                    fontSize:        '9px',
                    fontWeight:      700,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    borderRadius:    '99px',
                    padding:         '0 3px',
                    lineHeight:      1,
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>

              <span style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '9px',
                fontWeight:    active ? 700 : 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight:    1,
              }}>
                {tab.label}
              </span>
            </a>
          )
        })}
      </nav>

      {/* Hide on desktop */}
      <style>{`
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
