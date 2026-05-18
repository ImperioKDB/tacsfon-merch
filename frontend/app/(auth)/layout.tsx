// app/(auth)/layout.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Auth layout — full-screen, no Navbar/Footer.
 * Desktop: editorial brand panel on left, form on right.
 * Mobile: form only, brand panel hidden.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Brand panel (md+) ────────────────────────────────────────── */}
      <div
        className="hidden md:flex"
        style={{
          width: '48%',
          minHeight: '100vh',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Back to store — hover via CSS class instead of inline handlers */}
        <Link
          href="/"
          className="link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'color var(--duration-fast) var(--ease-smooth)',
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to store
        </Link>

        {/* Brand statement */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontWeight: 700,
              fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
              lineHeight: 0.92,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
              marginBottom: '32px',
            }}
          >
            TACSFON<br />
            <span style={{ color: 'var(--color-gold)' }}>MERCH</span>
          </h1>

          {/* Gold rule */}
          <div
            style={{
              width: '48px',
              height: '2px',
              background: 'var(--color-gold)',
              marginBottom: '24px',
            }}
          />

          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.75,
              maxWidth: '280px',
            }}
          >
            Wear the community.<br />Own the standard.
          </p>
        </div>

        {/* Footer note */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            color: 'var(--color-text-disabled)',
            textTransform: 'uppercase',
          }}
        >
          &copy; {new Date().getFullYear()} TACSFON Merch
        </p>
      </div>

      {/* ── Form area ────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          overflowY: 'auto',
        }}
      >
        {/* Mobile: back link — no event handlers, just uses .link class */}
        <div
          className="flex md:hidden"
          style={{ width: '100%', maxWidth: '400px', marginBottom: '32px' }}
        >
          <Link
            href="/"
            className="link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Store
          </Link>
        </div>

        {/* Page content */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}