'use client'

/**
 * CartSummary — Phase 6
 * Inline CSS only — no Tailwind utility classes.
 */

import Link from 'next/link'
import { formatPrice } from '@/lib/utils/formatters'

interface CartSummaryProps {
  subtotal:    number
  itemCount:   number
  onClearCart: () => void
  isClearing?: boolean
}

export default function CartSummary({ subtotal, itemCount, onClearCart, isClearing = false }: CartSummaryProps) {
  return (
    <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, background: 'var(--bg-base)', borderTop: '1px solid var(--border)', padding: '20px 24px', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Subtotal · {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>
          {formatPrice(subtotal)}
        </span>
      </div>

      <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '56px', background: 'var(--accent)', color: '#0A0A0A', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
        Proceed to Checkout →
      </Link>

      <button onClick={onClearCart} disabled={isClearing} style={{ background: 'transparent', border: 'none', cursor: isClearing ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', padding: '4px', opacity: isClearing ? 0.5 : 1 }}>
        {isClearing ? 'Clearing…' : 'Clear Cart'}
      </button>
    </div>
  )
}
