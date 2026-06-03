'use client'

/**
 * OrderCard
 *
 * Dark surface card for the orders list.
 * Shows: order number (Space Mono), item count, total, status badge,
 * and the first item's thumbnail.
 *
 * Props: order: Order
 * Navigates to /orders/[id] on click.
 */

import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/types'

interface Props {
  order: Order
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment:   'AWAITING PAYMENT',
  payment_submitted: 'PROOF SUBMITTED',
  confirmed:         'CONFIRMED',
  dispatched:        'DISPATCHED',
  received:          'RECEIVED',
  cancelled:         'CANCELLED',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment:   '#C9A84C',
  payment_submitted: '#60A5FA',
  confirmed:         '#2DD4BF',
  dispatched:        '#C084FC',
  received:          '#4CAF7D',
  cancelled:         '#E05252',
}

export default function OrderCard({ order }: Props) {
  const router     = useRouter()
  const color      = STATUS_COLOR[order.status] ?? '#888880'
  const label      = STATUS_LABEL[order.status] ?? order.status
  const itemCount  = order.items?.length ?? 0
  const firstItem  = order.items?.[0]
  const thumbUrl   = (firstItem as any)?.variant?.product?.image_url ?? null

  return (
    <div
      onClick={() => router.push(`/orders/${order.id}`)}
      style={{
        display:       'flex',
        alignItems:    'stretch',
        gap:           '0',
        background:    'var(--bg-surface)',
        border:        '1px solid var(--border)',
        cursor:        'pointer',
        overflow:      'hidden',
        transition:    'border-color 0.2s ease, transform 0.15s ease',
        position:      'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.35)'
        ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateY(0)'
      }}
    >
      {/* ── Thumbnail strip ── */}
      <div style={{
        width:      '72px',
        minHeight:  '88px',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
        overflow:   'hidden',
        position:   'relative',
      }}>
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            style={{
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              display:    'block',
            }}
          />
        ) : (
          /* Placeholder grid pattern */
          <div style={{
            width:      '100%',
            height:     '100%',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 12px)',
          }} />
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex:           1,
        padding:        '14px 16px',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
        gap:            '10px',
        minWidth:       0,
      }}>
        {/* Top row: order number + status */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          gap:            '8px',
          flexWrap:       'wrap',
        }}>
          <p style={{
            margin:        0,
            fontFamily:    'var(--font-mono)',
            fontSize:      '12px',
            color:         'var(--text-muted)',
            letterSpacing: '0.06em',
            whiteSpace:    'nowrap',
          }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </p>

          {/* Status badge */}
          <span style={{
            display:       'inline-block',
            padding:       '3px 10px',
            background:    `${color}1A`,
            border:        `1px solid ${color}44`,
            color:         color,
            fontFamily:    'var(--font-body)',
            fontSize:      '10px',
            fontWeight:    700,
            letterSpacing: '0.1em',
            whiteSpace:    'nowrap',
          }}>
            {label}
          </span>
        </div>

        {/* Bottom row: item count + total */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
        }}>
          <p style={{
            margin:     0,
            fontFamily: 'var(--font-body)',
            fontSize:   '12px',
            color:      'var(--text-muted)',
          }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <p style={{
            margin:     0,
            fontFamily: 'var(--font-body)',
            fontSize:   '16px',
            fontWeight: 600,
            color:      'var(--accent)',
          }}>
            ₦{(order.total ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Gold left-edge accent on hover ── */}
      <div style={{
        position:   'absolute',
        left:       0,
        top:        0,
        bottom:     0,
        width:      '2px',
        background: color,
        opacity:    0.6,
      }} />
    </div>
  )
}
