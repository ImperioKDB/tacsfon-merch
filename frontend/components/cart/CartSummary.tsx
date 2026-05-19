'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

interface Props {
  itemCount:   number
  total:       number
  onClearCart: () => void
}

export default function CartSummary({ itemCount, total, onClearCart }: Props) {
  const fmt = (n: number) => `₦${n.toLocaleString('en-NG')}`

  return (
    <div className="sticky top-24 p-6 rounded-2xl border"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'var(--glass-blur)',
      }}>
      <h2 className="text-lg font-bold mb-6"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}>
        Order Summary
      </h2>

      <div className="space-y-3 mb-6">
        {[
          { label: `Items (${itemCount})`, value: fmt(total) },
          { label: 'Delivery',             value: 'Free',
            vStyle: { color: 'var(--color-success)', fontWeight: 600 } },
        ].map(({ label, value, vStyle }) => (
          <div key={label} className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
            <span style={{ color: 'var(--color-text-primary)', ...vStyle }}>{value}</span>
          </div>
        ))}
        <div className="h-px" style={{ background: 'var(--color-border)' }} />
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Total</span>
          <span className="text-2xl font-extrabold tabular-nums"
            style={{ color: 'var(--color-gold)', fontFamily: 'Urbanist, sans-serif' }}>
            {fmt(total)}
          </span>
        </div>
      </div>

      <Link href="/checkout"
        className="flex items-center justify-center gap-2 w-full h-14 rounded-xl font-bold text-sm"
        style={{ background: 'var(--color-gold)', color: '#000', transition: 'all var(--duration-fast)' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.background = 'var(--color-gold-light)'
          el.style.transform  = 'translateY(-1px)'
          el.style.boxShadow  = 'var(--shadow-gold)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.background = 'var(--color-gold)'
          el.style.transform  = 'translateY(0)'
          el.style.boxShadow  = 'none'
        }}>
        <ShoppingBag size={18} />
        Proceed to Checkout
      </Link>

      <button onClick={onClearCart}
        className="mt-4 w-full py-2 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-error)' }}>
        Clear Cart
      </button>
    </div>
  )
}