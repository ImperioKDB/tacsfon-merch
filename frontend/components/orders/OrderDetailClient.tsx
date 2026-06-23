'use client'

import { useState, useEffect }    from 'react'
import { useRouter }               from 'next/navigation'
import { apiFetch }                from '@/lib/api/fetch'
import StatusTimeline              from '@/components/orders/StatusTimeline'
import MarkReceivedDialog          from '@/components/orders/MarkReceivedDialog'
import StepUploadProof             from '@/components/checkout/StepUploadProof'
import type { Order, OrderStatus } from '@/types'

interface Props {
  orderId: string
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
  pending_payment:   'var(--warning)',
  payment_submitted: 'var(--info)',
  confirmed:         '#2DD4BF',
  dispatched:        '#C084FC',
  received:          'var(--success)',
  cancelled:         'var(--danger)',
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:   'var(--bg-surface)',
      border:       '1px solid var(--border)',
      padding:      '20px',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin:        '0 0 16px',
      fontFamily:    'var(--font-display)',
      fontSize:      '16px',
      letterSpacing: '0.08em',
      color:         'var(--text-primary)',
    }}>
      {children}
    </p>
  )
}

export default function OrderDetailClient({ orderId }: Props) {
  const router = useRouter()

  const [order,        setOrder]        = useState<Order | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [showReceived, setShowReceived] = useState(false)

  useEffect(() => {
    apiFetch<Order>(`/orders/${orderId}`)
      .then(res => setOrder(res))
      .catch(err => setError(err.message || 'Failed to load order.'))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '40vh',
        fontFamily:     'var(--font-body)',
        fontSize:       '13px',
        color:          'var(--text-muted)',
        letterSpacing:  '0.05em',
      }}>
        Loading order…
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '40vh',
        gap:            '16px',
        fontFamily:     'var(--font-body)',
        textAlign:      'center',
        padding:        '24px',
      }}>
        <p style={{ color: 'var(--danger)', fontSize: '13px', margin: 0 }}>
          {error ?? 'Order not found.'}
        </p>
        <button
          onClick={() => router.push('/orders')}
          style={{
            background:    'none',
            border:        '1px solid var(--border)',
            color:         'var(--text-muted)',
            padding:       '10px 24px',
            fontSize:      '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily:    'var(--font-body)',
            cursor:        'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    )
  }

  const statusColor = STATUS_COLOR[order.status] ?? 'var(--text-muted)'
  const statusLabel = STATUS_LABEL[order.status] ?? order.status

  return (
    <div style={{
      maxWidth:   '680px',
      margin:     '0 auto',
      padding:    '24px 16px 96px',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          background:    'none',
          border:        'none',
          color:         'var(--text-muted)',
          fontFamily:    'var(--font-body)',
          fontSize:      '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor:        'pointer',
          padding:       '0 0 20px 0',
          display:       'flex',
          alignItems:    'center',
          gap:           '6px',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Orders
      </button>

      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexWrap:       'wrap',
        gap:            '10px',
        marginBottom:   '20px',
      }}>
        <div>
          <h1 style={{
            margin:        '0 0 3px',
            fontFamily:    'var(--font-display)',
            fontSize:      '24px',
            letterSpacing: '0.08em',
            color:         'var(--text-primary)',
          }}>
            ORDER DETAIL
          </h1>
          <p style={{
            margin:        0,
            fontFamily:    'var(--font-mono)',
            fontSize:      '11px',
            color:         'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span style={{
          display:       'inline-block',
          padding:       '5px 12px',
          background:    `color-mix(in srgb, ${statusColor} 15%, transparent)`,
          border:        `1px solid color-mix(in srgb, ${statusColor} 40%, transparent)`,
          color:         statusColor,
          fontFamily:    'var(--font-body)',
          fontSize:      '10px',
          fontWeight:    700,
          letterSpacing: '0.12em',
        }}>
          {statusLabel}
        </span>
      </div>

      {/* Timeline */}
      <Section>
        <SectionHead>PROGRESS</SectionHead>
        <StatusTimeline status={order.status} />
      </Section>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <Section>
          <SectionHead>ITEMS</SectionHead>
          {order.items.map((item: any, i: number) => {
            const name   = item.variant?.product?.name ?? item.product_name ?? 'Product'
            const price  = (item.unit_price ?? 0) * (item.quantity ?? 1)
            const label  = [item.variant?.size, item.variant?.color].filter(Boolean).join(' / ')
            const isLast = i === order.items!.length - 1
            return (
              <div key={item.id ?? i} style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'flex-start',
                gap:            '12px',
                padding:        '10px 0',
                borderBottom:   isLast ? 'none' : '1px solid var(--border)',
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin:        '0 0 2px',
                    fontFamily:    'var(--font-display)',
                    fontSize:      '15px',
                    letterSpacing: '0.04em',
                    color:         'var(--text-primary)',
                    overflow:      'hidden',
                    whiteSpace:    'nowrap',
                    textOverflow:  'ellipsis',
                  }}>
                    {name}
                  </p>
                  {label && (
                    <p style={{
                      margin:     0,
                      fontFamily: 'var(--font-body)',
                      fontSize:   '11px',
                      color:      'var(--text-muted)',
                    }}>
                      {label} · Qty: {item.quantity}
                    </p>
                  )}
                </div>
                <p style={{
                  margin:     0,
                  fontFamily: 'var(--font-body)',
                  fontSize:   '14px',
                  fontWeight: 600,
                  color:      'var(--accent)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  ₦{price.toLocaleString()}
                </p>
              </div>
            )
          })}
          {/* Total */}
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            paddingTop:     '14px',
            marginTop:      '4px',
            borderTop:      '1px solid var(--border)',
          }}>
            <span style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '11px',
              letterSpacing: '0.1em',
              color:         'var(--text-muted)',
              textTransform: 'uppercase',
            }}>
              Total
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize:   '18px',
              fontWeight: 700,
              color:      'var(--accent)',
            }}>
              ₦{(order.total ?? 0).toLocaleString()}
            </span>
          </div>
        </Section>
      )}

      {/* Delivery address */}
      {order.delivery_address && (
        <Section>
          <SectionHead>DELIVERY ADDRESS</SectionHead>
          <p style={{
            margin:     0,
            fontFamily: 'var(--font-body)',
            fontSize:   '13px',
            color:      'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            {order.delivery_address}
          </p>
        </Section>
      )}

      {/* Upload proof — pending_payment */}
      {order.status === 'pending_payment' && (
        <Section>
          <SectionHead>UPLOAD PAYMENT PROOF</SectionHead>
          <StepUploadProof
            orderId={order.id}
            onDone={() => router.push('/orders')}
            onBack={() => router.back()}
          />
        </Section>
      )}

      {/* Mark received CTA — dispatched */}
      {order.status === 'dispatched' && (
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => setShowReceived(true)}
            style={{
              width:         '100%',
              minHeight:     '52px',
              background:    'var(--success)',
              border:        'none',
              color:         '#0A0A0A',
              fontFamily:    'var(--font-body)',
              fontSize:      '12px',
              fontWeight:    700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor:        'pointer',
              transition:    'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Mark as Received
          </button>
        </div>
      )}

      {showReceived && (
        <MarkReceivedDialog
          orderId={order.id}
          onSuccess={() => { setShowReceived(false); router.refresh() }}
          onCancel={() => setShowReceived(false)}
        />
      )}
    </div>
  )
}
