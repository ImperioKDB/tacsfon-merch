import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Not Found' }

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        gap: '20px',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.6875rem',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
        }}
      >
        404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          letterSpacing: '0.02em',
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.9375rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '380px',
          lineHeight: 1.7,
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '12px',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          border: '1px solid var(--color-gold)',
          padding: '12px 28px',
          textDecoration: 'none',
          display: 'inline-block',
          transition: 'background var(--duration-fast) var(--ease-smooth)',
        }}
      >
        Back to Home
      </Link>
    </div>
  )
}