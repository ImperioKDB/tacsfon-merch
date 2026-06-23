'use client'

/**
 * OrdersClient
 *
 * Fetches and lists all orders for the authenticated student.
 *
 * FIX: apiFetch already unwraps the { success, data } envelope and returns
 * body.data ?? body. The backend GET /api/orders returns the orders array
 * directly inside `data`, so after unwrapping we receive Order[] directly.
 * The previous code typed the return as { data: Order[] } and accessed
 * .data on it — which is undefined on an array — so the list was always
 * empty regardless of what the server returned.
 */

import { useState, useEffect } from 'react'
import { apiFetch }            from '@/lib/api/fetch'
import OrderCard               from '@/components/orders/OrderCard'
import type { Order }          from '@/types'

export default function OrdersClient() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    // apiFetch unwraps { success, data } → returns the payload directly.
    // Backend sends: { success: true, data: Order[] }
    // After unwrap:  Order[]
    apiFetch<Order[]>('/orders')
      .then(res => setOrders(Array.isArray(res) ? res : []))
      .catch(err => setError(err.message || 'Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height:     '88px',
            background: 'var(--bg-surface)',
            border:     '1px solid var(--border)',
            animation:  'pulse 1.5s ease-in-out infinite',
            opacity:    1 - i * 0.15,
          }} />
        ))}
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{
        padding:    '48px 16px',
        textAlign:  'center',
        fontFamily: 'var(--font-body)',
        fontSize:   '14px',
        color:      'var(--danger)',
      }}>
        {error}
      </div>
    )
  }

  /* ── Empty state ── */
  if (orders.length === 0) {
    return (
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '40vh',
        gap:            '20px',
        fontFamily:     'var(--font-body)',
        textAlign:      'center',
      }}>
        <div style={{
          width:      '56px',
          height:     '56px',
          border:     '1px solid var(--border)',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <div>
          <p style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
            margin:        '0 0 8px',
          }}>
            No Orders Yet
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '14px',
            color:      'var(--text-muted)',
            margin:     0,
            lineHeight: 1.6,
          }}>
            Your order history will appear here once you place your first order.
          </p>
        </div>
        <a
          href="/products"
          style={{
            display:       'inline-block',
            padding:       '13px 32px',
            background:    'var(--accent)',
            border:        'none',
            color:         '#0A0A0A',
            fontFamily:    'var(--font-body)',
            fontSize:      '12px',
            fontWeight:    700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration:'none',
            cursor:        'pointer',
          }}
        >
          Shop Now
        </a>
      </div>
    )
  }

  /* ── Orders list ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
