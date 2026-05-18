'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error without exposing to user — matches backend logging standard
    console.error('[GlobalError]', error.message, error.digest)
  }, [error])

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
          color: 'var(--color-error)',
        }}
      >
        Error
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        Something Went Wrong
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
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '12px',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#0A0A0F',
          background: 'var(--color-gold)',
          border: 'none',
          padding: '12px 28px',
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  )
}