'use client'

/**
 * OrdersClient
 *
 * Fetches and lists all orders for the authenticated student.
 * Renders a grid of OrderCard components.
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
    apiFetch<{ data: Order[] }>('/orders')
      .then(res => setOrders(res.data ?? []))
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
        padding:        '48px 16px',
        textAlign:      'center',
        fontFamily:     'var(--font-body)',
        fontSize:       '14px',
        color:          'var(--danger)',
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
        {/* Icon */}
        <div style={{
          width:      '56px',
          height:     '56px',
          border:     '1px solid var(--border)',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <div>
          <p style={{
            margin:        '0 0 6px',
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            letterSpacing: '0.08em',
            color:         'var(--text-primary)',
          }}>
            NO ORDERS YET
          </p>
          <p style={{
            margin:     0,
            fontSize:   '13px',
            color:      'var(--text-muted)',
            lineHeight: 1.5,
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
            color:         '#0A0A0A',
            fontFamily:    'var(--font-body)',
            fontSize:      '12px',
            fontWeight:    700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Shop Now
        </a>
      </div>
    )
  }

  /* ── List ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
