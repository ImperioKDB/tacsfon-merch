'use client'

/**
 * BottomNav
 * Deep premium green background.
 * BLACK icons and labels for maximum contrast/visibility.
 * Active tab: full black. Idle: 55% black opacity.
 * Cart badge: black bg, white text.
 */

import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cart'

/* Premium green — richer/deeper than #3DBA6F */
const NAV_BG      = '#2A9E5A'
const ICON_ACTIVE = '#0A0A0A'
const ICON_IDLE   = 'rgba(0,0,0,0.5)'
const LBL_ACTIVE  = '#0A0A0A'
const LBL_IDLE    = 'rgba(0,0,0,0.5)'
const INDICATOR   = '#0A0A0A'
const BADGE_BG    = '#0A0A0A'
const BADGE_TEXT  = '#FFFFFF'

const TABS = [
  {
    href:  '/',
    label: 'Home',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? ICON_ACTIVE : 'none'}
        stroke={active ? ICON_ACTIVE : ICON_IDLE}
        strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href:  '/products',
    label: 'Products',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? ICON_ACTIVE : 'none'}
        stroke={active ? ICON_ACTIVE : ICON_IDLE}
        strokeWidth="1.8">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    href:  '/cart',
    label: 'Cart',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? ICON_ACTIVE : 'none'}
        stroke={active ? ICON_ACTIVE : ICON_IDLE}
        strokeWidth="1.8">
        <circle cx="9"  cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    href:  '/orders',
    label: 'Orders',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? ICON_ACTIVE : 'none'}
        stroke={active ? ICON_ACTIVE : ICON_IDLE}
        strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    href:  '/profile',
    label: 'Profile',
    icon:  (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? ICON_ACTIVE : 'none'}
        stroke={active ? ICON_ACTIVE : ICON_IDLE}
        strokeWidth="1.8">
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
        className="bottom-nav"
        style={{
          position:   'fixed',
          bottom:     0, left: 0, right: 0,
          zIndex:     90,
          height:     '62px',
          display:    'flex',
          alignItems: 'stretch',
          background: NAV_BG,
          boxShadow:  '0 -4px 20px rgba(42,158,90,0.4)',
        }}
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
                position:       'relative',
              }}
            >
              {/* Active indicator — black bar at top */}
              {active && (
                <span style={{
                  position:     'absolute',
                  top:          0,
                  left:         '50%',
                  transform:    'translateX(-50%)',
                  width:        '28px',
                  height:       '3px',
                  background:   INDICATOR,
                  borderRadius: '0 0 3px 3px',
                }} />
              )}

              {/* Icon + cart badge */}
              <span style={{ position: 'relative', display: 'flex' }}>
                {tab.icon(active)}
                {isCart && cartCount > 0 && (
                  <span style={{
                    position:       'absolute',
                    top:            '-4px',
                    right:          '-6px',
                    minWidth:       '16px',
                    height:         '16px',
                    background:     BADGE_BG,
                    color:          BADGE_TEXT,
                    fontFamily:     'var(--font-body)',
                    fontSize:       '9px',
                    fontWeight:     700,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    borderRadius:   '99px',
                    padding:        '0 3px',
                    lineHeight:     1,
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>

              {/* Label */}
              <span style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '9px',
                fontWeight:    active ? 700 : 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight:    1,
                color:         active ? LBL_ACTIVE : LBL_IDLE,
              }}>
                {tab.label}
              </span>
            </a>
          )
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
