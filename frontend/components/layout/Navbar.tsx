'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Menu, X, LayoutDashboard, LogOut, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/cart'
import { useNotificationStore } from '@/store/notifications'
import { NavLink } from './NavLink'

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const pathname                  = usePathname()
  const { user, isAdmin, signOut, loading } = useAuth()
  const cartCount    = useCartStore((s) => s.count)
  const unreadCount  = useNotificationStore((s) => s.unreadCount)

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Detect scroll for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* ── Main bar ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          background: scrolled
            ? 'rgba(10,10,10,0.92)'
            : 'rgba(10,10,10,0.80)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderImage: 'linear-gradient(90deg, var(--accent), transparent) 1',
          transition: 'background 250ms ease, box-shadow 250ms ease',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
          }}
        >
          {/* ── Left: desktop nav links ── */}
          <nav
            className="hidden md:flex"
            style={{ gap: '32px', alignItems: 'center' }}
            aria-label="Primary navigation"
          >
            <NavLink href="/products">Store</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* ── Centre: Logo ── */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
            aria-label="TACSFON Merch — Home"
          >
            {/* Gold dot */}
            <span
              aria-hidden="true"
              style={{
                width: '6px',
                height: '6px',
                background: 'var(--accent)',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                letterSpacing: '0.12em',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              TACSFON
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.22em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              MERCH
            </span>
          </Link>

          {/* ── Right: icon actions ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
            }}
          >
            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              style={{
                position: 'relative',
                padding: '10px',
                color: 'var(--text-muted)',
                transition: 'color 150ms ease',
                display: 'flex',
              }}
              className="hover:text-[var(--text-primary)]"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'var(--accent)',
                    color: '#000',
                    fontSize: '9px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications — only when logged in */}
            {user && (
              <Link
                href="/notifications"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                style={{
                  position: 'relative',
                  padding: '10px',
                  color: 'var(--text-muted)',
                  transition: 'color 150ms ease',
                  display: 'flex',
                }}
                className="hover:text-[var(--text-primary)]"
              >
                <Bell size={20} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'var(--danger)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      border: '2px solid var(--bg-base)',
                    }}
                  />
                )}
              </Link>
            )}

            {/* Profile / Sign In — desktop only */}
            <div className="hidden md:flex items-center" style={{ marginLeft: '4px' }}>
              {!loading && (
                user ? (
                  <Link
                    href="/profile"
                    aria-label="My profile"
                    style={{
                      padding: '10px',
                      color: 'var(--text-muted)',
                      transition: 'color 150ms ease',
                      display: 'flex',
                    }}
                    className="hover:text-[var(--text-primary)]"
                  >
                    <User size={20} strokeWidth={1.5} />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#000',
                      background: 'var(--accent)',
                      padding: '8px 18px',
                      transition: 'background 150ms ease',
                      whiteSpace: 'nowrap',
                    }}
                    className="hover:bg-[var(--accent-hover)]"
                  >
                    Sign In
                  </Link>
                )
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden"
              style={{
                padding: '10px',
                color: 'var(--text-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px',
              }}
            >
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen overlay menu ── */}
      <div
        aria-hidden={!menuOpen}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 190,
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          padding: '96px 32px 48px',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: menuOpen ? 'all' : 'none',
        }}
      >
        {/* Primary links — staggered */}
        <nav
          aria-label="Mobile navigation"
          style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
        >
          {[
            { href: '/products', label: 'STORE' },
            { href: '/about',    label: 'ABOUT' },
            { href: '/contact',  label: 'CONTACT' },
          ].map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 10vw, 64px)',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border)',
                padding: '16px 0',
                lineHeight: 1,
                letterSpacing: '0.04em',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateX(0)' : 'translateX(20px)',
                transition: `opacity 350ms ease ${i * 60 + 80}ms, transform 350ms ease ${i * 60 + 80}ms`,
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom auth area */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 350ms ease 280ms, transform 350ms ease 280ms`,
          }}
        >
          {!loading && user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    padding: '14px 18px',
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard size={16} />
                  Admin Panel
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '14px 18px',
                  textDecoration: 'none',
                }}
              >
                <User size={16} />
                My Profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); signOut() }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--danger)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '14px 0',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#000',
                background: 'var(--accent)',
                padding: '16px 24px',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Spacer so page content clears the fixed bar */}
      <div style={{ height: '64px' }} aria-hidden="true" />
    </>
  )
}
