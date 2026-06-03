'use client'

/**
 * AdminShell
 *
 * Phase 10 — Admin UI.
 * Left sidebar nav (collapsible on desktop, overlay drawer on mobile).
 * Admin accent: #5B8CFF (blue) — distinct from storefront gold.
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_ACCENT = '#5B8CFF'

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IconDashboard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function IconBox({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
function IconShoppingBag({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
function IconTag({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function IconReceipt({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
function IconActivity({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IconChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconChevronLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IconMenu({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function IconX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Nav config ────────────────────────────────────────────────────────────────

interface NavItem {
  label:     string
  href:      string
  icon:      React.ReactNode
  children?: { label: string; href: string }[]
}

const ORDER_CHILDREN = [
  { label: 'Pending',    href: '/pending'    },
  { label: 'Confirmed',  href: '/confirmed'  },
  { label: 'Dispatched', href: '/dispatched' },
  { label: 'Completed',  href: '/completed'  },
  { label: 'History',    href: '/history'    },
]

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/admin',          icon: <IconDashboard /> },
  { label: 'Products',   href: '/admin/products', icon: <IconBox /> },
  { label: 'Orders',     href: '/pending',        icon: <IconShoppingBag />, children: ORDER_CHILDREN },
  { label: 'Categories', href: '/categories',     icon: <IconTag /> },
  { label: 'Admins',     href: '/admins',         icon: <IconUsers /> },
  { label: 'Receipts',   href: '/receipts',       icon: <IconReceipt /> },
  { label: 'Logs',       href: '/logs',           icon: <IconActivity /> },
]

// ── AdminShell ────────────────────────────────────────────────────────────────

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [ordersOpen,  setOrdersOpen]  = useState(() =>
    ORDER_CHILDREN.some(c => pathname.startsWith(c.href))
  )
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // ── Single nav item ───────────────────────────────────────────────────────
  function NavItemEl({ item, compact }: { item: NavItem; compact: boolean }) {
    const active         = isActive(item.href)
    const anyChildActive = item.children?.some(c => pathname.startsWith(c.href)) ?? false
    const isHighlighted  = active || anyChildActive

    const baseStyle: React.CSSProperties = {
      display:        'flex',
      alignItems:     'center',
      gap:            '10px',
      padding:        compact ? '10px 0' : '10px 12px',
      justifyContent: compact ? 'center' : 'flex-start',
      background:     isHighlighted ? `${ADMIN_ACCENT}14` : 'transparent',
      borderLeft:     isHighlighted ? `2px solid ${ADMIN_ACCENT}` : '2px solid transparent',
      color:          isHighlighted ? ADMIN_ACCENT : 'var(--text-muted)',
      fontFamily:     'var(--font-body)',
      fontSize:       '13px',
      fontWeight:     isHighlighted ? 600 : 400,
      letterSpacing:  '0.04em',
      textDecoration: 'none',
      cursor:         'pointer',
      transition:     'all 0.15s ease',
      borderRadius:   '0 4px 4px 0',
      width:          '100%',
      border:         'none',
      borderLeftWidth: '2px',
      borderLeftStyle: 'solid',
      boxSizing:      'border-box' as const,
    }

    if (item.children) {
      return (
        <div>
          <button
            onClick={() => setOrdersOpen(o => !o)}
            style={{ ...baseStyle, justifyContent: compact ? 'center' : 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!compact && <span>{item.label}</span>}
            </span>
            {!compact && (
              <span style={{ transition: 'transform 0.2s', transform: ordersOpen ? 'rotate(180deg)' : 'none', display: 'flex' }}>
                <IconChevronDown />
              </span>
            )}
          </button>
          {!compact && ordersOpen && (
            <div style={{ paddingLeft: '40px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {item.children.map(child => {
                const childActive = pathname.startsWith(child.href)
                return (
                  <Link key={child.href} href={child.href} style={{
                    display:        'block',
                    padding:        '7px 12px',
                    fontFamily:     'var(--font-body)',
                    fontSize:       '12px',
                    color:          childActive ? ADMIN_ACCENT : 'var(--text-muted)',
                    fontWeight:     childActive ? 600 : 400,
                    textDecoration: 'none',
                    borderRadius:   '4px',
                    background:     childActive ? `${ADMIN_ACCENT}0D` : 'transparent',
                    transition:     'color 0.15s, background 0.15s',
                  }}>
                    {child.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link href={item.href} style={baseStyle}>
        <span style={{ flexShrink: 0 }}>{item.icon}</span>
        {!compact && <span>{item.label}</span>}
      </Link>
    )
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────
  function Sidebar({ compact, mobile = false }: { compact: boolean; mobile?: boolean }) {
    return (
      <div style={{
        width:         mobile ? '260px' : compact ? '56px' : '220px',
        height:        '100dvh',
        background:    '#0D0D0D',
        borderRight:   `1px solid rgba(91,140,255,0.1)`,
        display:       'flex',
        flexDirection: 'column',
        flexShrink:    0,
        position:      mobile ? 'relative' : 'sticky',
        top:           0,
        transition:    'width 0.2s ease',
        overflowX:     'hidden',
        overflowY:     'auto',
      }}>
        {/* Header */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: compact && !mobile ? 'center' : 'space-between',
          padding:        compact && !mobile ? '20px 0' : '20px 16px',
          borderBottom:   `1px solid rgba(91,140,255,0.08)`,
          flexShrink:     0,
        }}>
          {(!compact || mobile) && (
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', color: ADMIN_ACCENT, letterSpacing: '0.2em' }}>
                TACSFON
              </p>
              <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
                ADMIN
              </p>
            </div>
          )}
          {!mobile ? (
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                background:   'transparent',
                border:       `1px solid rgba(91,140,255,0.15)`,
                color:        'var(--text-muted)',
                padding:      '4px',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                borderRadius: '4px',
              }}
            >
              {compact ? <IconChevronRight /> : <IconChevronLeft />}
            </button>
          ) : (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              <IconX />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => (
            <NavItemEl key={item.href} item={item} compact={compact && !mobile} />
          ))}
        </nav>

        {/* Back to store */}
        <div style={{ padding: compact && !mobile ? '16px 0' : '16px', borderTop: `1px solid rgba(91,140,255,0.08)`, flexShrink: 0 }}>
          <Link href="/" style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '8px',
            justifyContent: compact && !mobile ? 'center' : 'flex-start',
            fontFamily:     'var(--font-body)',
            fontSize:       '12px',
            color:          'var(--text-muted)',
            textDecoration: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {(!compact || mobile) && <span>Back to Store</span>}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>

      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        <Sidebar compact={collapsed} />
      </div>

      {/* Mobile top bar */}
      <div className="admin-topbar-mobile">
        <div style={{
          position:       'fixed',
          top: 0, left: 0, right: 0,
          height:         '52px',
          background:     '#0D0D0D',
          borderBottom:   `1px solid rgba(91,140,255,0.1)`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '0 16px',
          zIndex:         50,
        }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <IconMenu />
          </button>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
            ADMIN
          </p>
          <div style={{ width: '20px' }} />
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div ref={drawerRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>
            <Sidebar compact={false} mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>

      <style>{`
        .admin-sidebar-desktop { display: none; }
        .admin-topbar-mobile   { display: block; }
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: flex !important; }
          .admin-topbar-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          main { padding-top: 52px; }
        }
      `}</style>
    </div>
  )
}
