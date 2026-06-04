'use client'

/**
 * EmptyCart — Phase 6
 * Inline CSS only — no Tailwind utility classes.
 */

import Link            from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function EmptyCart() {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '80px 24px',
        gap:            '24px',
        minHeight:      '60vh',
      }}
    >
      <div style={{ width: '96px', height: '96px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <ShoppingBag size={40} strokeWidth={0.8} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 6vw, 40px)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>
          Your Cart is Empty
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Looks like you haven&apos;t added anything yet.<br />
          Explore the store and find something you love.
        </p>
      </div>

      <Link
        href="/products"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', minHeight: '52px', padding: '0 36px', background: '#3DBA6F', color: '#0A0A0A', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', marginTop: '8px' }}
      >
        Shop Now →
      </Link>
    </div>
  )
}
