'use client'

/**
 * OrderDetailClient
 *
 * Renders a single order's full detail view for a student.
 * - Shows order status timeline
 * - Allows proof upload (step 3 of checkout flow) when status = pending_payment
 * - Allows "mark as received" when status = dispatched
 */

import { useState }              from 'react'
import { useRouter }             from 'next/navigation'
import { apiFetch }              from '@/lib/api/apiFetch'
import { StatusTimeline }        from '@/components/orders/StatusTimeline'
import { MarkReceivedDialog }    from '@/components/orders/MarkReceivedDialog'
import StepUploadProof           from '@/components/checkout/StepUploadProof'
import type { Order, OrderStatus } from '@/types'

interface Props {
  order: Order
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment:    'Awaiting Payment',
  payment_submitted:  'Payment Submitted',
  confirmed:          'Confirmed',
  dispatched:         'Dispatched',
  received:           'Received',
  cancelled:          'Cancelled',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment:   'var(--accent)',
  payment_submitted: '#60A5FA',
  confirmed:         '#2DD4BF',
  dispatched:        '#C084FC',
  received:          'var(--success)',
  cancelled:         'var(--danger)',
}

export default function OrderDetailClient({ order }: Props) {
  const router = useRouter()
  const [showReceived, setShowReceived] = useState(false)
  const [marking,      setMarking]      = useState(false)

  const handleMarkReceived = async () => {
    setMarking(true)
    try {
      await apiFetch(`/api/orders/${order.id}/received`, { method: 'POST' })
      router.refresh()
    } finally {
      setMarking(false)
      setShowReceived(false)
    }
  }

  const statusColor = STATUS_COLOR[order.status] ?? 'var(--text-muted)'
  const statusLabel = STATUS_LABEL[order.status] ?? order.status

  return (
    <div style={{
      maxWidth:   '720px',
      margin:     '0 auto',
      padding:    '32px 16px 80px',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => router.back()}
          style={{
            background:    'none',
            border:        'none',
            color:         'var(--text-muted)',
            fontFamily:    'var(--font-body)',
            fontSize:      '13px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor:        'pointer',
            padding:       '0 0 16px 0',
            display:       'block',
          }}
        >
          ← Back to orders
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      '28px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color:         'var(--text-primary)',
              margin:        '0 0 4px 0',
            }}>
              Order Detail
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <span style={{
            display:       'inline-block',
            padding:       '6px 14px',
            background:    `${statusColor}22`,
            border:        `1px solid ${statusColor}55`,
            color:         statusColor,
            fontFamily:    'var(--font-body)',
            fontSize:      '12px',
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border)',
        padding:      '24px',
        marginBottom: '24px',
      }}>
        <StatusTimeline status={order.status} />
      </div>

      {/* ── Items ── */}
      <div style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border)',
        padding:      '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '18px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color:         'var(--text-primary)',
          margin:        '0 0 20px 0',
        }}>
          Items
        </h2>

        {order.items?.map((item, i) => (
          <div key={i} style={{
            display:       'flex',
            justifyContent:'space-between',
            alignItems:    'center',
            padding:       '12px 0',
            borderBottom:  i < (order.items?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <p style={{ margin: '0 0 2px 0', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                {item.product_name ?? 'Product'}
              </p>
              {item.variant_label && (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>
                  {item.variant_label} · Qty: {item.quantity}
                </p>
              )}
            </div>
            <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>
              ₦{((item.unit_price ?? 0) * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}

        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          paddingTop:     '16px',
          marginTop:      '8px',
          borderTop:      '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px' }}>
            ₦{(order.total_amount ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Delivery info ── */}
      {order.delivery_address && (
        <div style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          padding:      '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '18px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
            margin:        '0 0 12px 0',
          }}>
            Delivery
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            {order.delivery_address}
          </p>
        </div>
      )}

      {/* ── Proof upload — shown when student still needs to pay ── */}
      {order.status === 'pending_payment' && (
        <div style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          padding:      '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '18px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
            margin:        '0 0 20px 0',
          }}>
            Upload Payment Proof
          </h2>
          <StepUploadProof
            orderId={order.id}
            onDone={() => router.push('/orders')}
            onBack={() => router.back()}
          />
        </div>
      )}

      {/* ── Mark as received ── */}
      {order.status === 'dispatched' && (
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setShowReceived(true)}
            style={{
              width:         '100%',
              minHeight:     '52px',
              background:    'var(--success)',
              border:        'none',
              color:         '#0A0A0A',
              fontFamily:    'var(--font-body)',
              fontSize:      '13px',
              fontWeight:    700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor:        'pointer',
            }}
          >
            Mark as Received
          </button>
        </div>
      )}

      {showReceived && (
        <MarkReceivedDialog
          onConfirm={handleMarkReceived}
          onCancel={() => setShowReceived(false)}
          loading={marking}
        />
      )}
    </div>
  )
}
