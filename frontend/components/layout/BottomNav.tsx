'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react'
import { useCartStore } from '@/store/cart'

const LINKS = [
  { href: '/',            label: 'Home',     Icon: Home         },
  { href: '/products',    label: 'Products', Icon: ShoppingBag  },
  { href: '/cart',        label: 'Cart',     Icon: ShoppingCart, badge: true },
  { href: '/orders',      label: 'Orders',   Icon: Package      },
  { href: '/profile',     label: 'Profile',  Icon: User         },
]

export default function BottomNav() {
  const pathname   = usePathname()
  const cartCount  = useCartStore(s => s.count)

  // Hide on admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/admins') ||
      pathname.startsWith('/categories') || pathname.startsWith('/pending') ||
      pathname.startsWith('/confirmed') || pathname.startsWith('/dispatched') ||
      pathname.startsWith('/completed') || pathname.startsWith('/history') ||
      pathname.startsWith('/logs') || pathname.startsWith('/receipts') ||
      pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null
  }

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        zIndex:          50,
        display:         'flex',
        alignItems:      'stretch',
        height:          '60px',
        background:      'rgba(10,10,10,0.96)',
        backdropFilter:  'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop:       '1px solid rgba(255,255,255,0.07)',
        /* only visible on mobile */
      }}
      className="md:hidden"
    >
      {LINKS.map(({ href, label, Icon, badge }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '3px',
              position:       'relative',
              color:          isActive ? '#3DBA6F' : 'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 150ms',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* active top-bar */}
            {isActive && (
              <span style={{
                position:   'absolute',
                top:        0,
                left:       '20%',
                right:      '20%',
                height:     '2px',
                background: '#3DBA6F',
                borderRadius: '0 0 2px 2px',
              }} />
            )}

            <span style={{ position: 'relative', display: 'flex' }}>
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {badge && cartCount > 0 && (
                <span style={{
                  position:       'absolute',
                  top:            '-5px',
                  right:          '-7px',
                  minWidth:       '16px',
                  height:         '16px',
                  padding:        '0 4px',
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
            </span>

            <span style={{
              fontSize:      '9px',
              fontFamily:    'var(--font-body)',
              fontWeight:    isActive ? 700 : 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight:    1,
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
