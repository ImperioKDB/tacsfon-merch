'use client';

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-8">
        <svg width="140" height="140" viewBox="0 0 140 140"
          fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="70" cy="70" r="66" fill="#1C1C26" />
          <path d="M34 44h12l13 44h42l10-34H52"
            stroke="#2A2A38" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="62" cy="96" r="4" fill="#2A2A38" />
          <circle cx="84" cy="96" r="4" fill="#2A2A38" />
          <path d="M58 54l8 30h30l8-26"
            stroke="#C9A84C" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          <line x1="63" y1="62" x2="71" y2="70"
            stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="71" y1="62" x2="63" y2="70"
            stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="112" cy="36" r="3" fill="#C9A84C" opacity="0.35" />
          <circle cx="24"  cy="90" r="2" fill="#C9A84C" opacity="0.25" />
          <circle cx="118" cy="88" r="2" fill="#C9A84C" opacity="0.20" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-3"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}>
        Your cart is empty
      </h2>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Looks like you haven&apos;t added anything yet.
        Browse our collection and find something you love.
      </p>

      <Link href="/products"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm"
        style={{ background: 'var(--color-gold)', color: '#000', transition: 'all var(--duration-fast)' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.background = 'var(--color-gold-light)'
          el.style.transform  = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.background = 'var(--color-gold)'
          el.style.transform  = 'translateY(0)'
        }}>
        <ShoppingCart size={16} />
        Start Shopping
      </Link>
    </div>
  )
}