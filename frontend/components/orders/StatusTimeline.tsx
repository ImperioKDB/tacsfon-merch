'use client'

/**
 * StatusTimeline
 *
 * Vertical gold-dot timeline showing order progress.
 * Completed steps: filled gold circle + gold connecting line.
 * Current step:    pulsing gold ring.
 * Upcoming steps:  hollow muted circle.
 *
 * Design: TACSFON Merch — dark editorial streetwear.
 * Fonts: Bebas Neue (labels) · DM Sans (sub-labels)
 */

import type { OrderStatus } from '@/types'

interface Props {
  status: OrderStatus
}

const STEPS: { key: OrderStatus; label: string; sub: string }[] = [
  { key: 'pending_payment',   label: 'AWAITING PAYMENT',   sub: 'Place your bank transfer' },
  { key: 'payment_submitted', label: 'PROOF SUBMITTED',    sub: 'Admin reviewing your receipt' },
  { key: 'confirmed',         label: 'ORDER CONFIRMED',    sub: 'Payment verified' },
  { key: 'dispatched',        label: 'DISPATCHED',         sub: 'On its way to you' },
  { key: 'received',          label: 'RECEIVED',           sub: 'Order complete' },
]

const ORDER: OrderStatus[] = [
  'pending_payment',
  'payment_submitted',
  'confirmed',
  'dispatched',
  'received',
]

export default function StatusTimeline({ status }: Props) {
  const isCancelled = status === 'cancelled'
  const currentIdx  = isCancelled ? -1 : ORDER.indexOf(status)

  return (
    <div style={{ padding: '4px 0' }}>
      {isCancelled ? (
        <div style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '12px',
          padding:       '12px 0',
        }}>
          <div style={{
            width:        '14px',
            height:       '14px',
            borderRadius: '50%',
            background:   'var(--danger)',
            flexShrink:   0,
          }} />
          <div>
            <p style={{
              margin:        0,
              fontFamily:    'var(--font-display)',
              fontSize:      '16px',
              letterSpacing: '0.08em',
              color:         'var(--danger)',
            }}>
              ORDER CANCELLED
            </p>
            <p style={{
              margin:     '2px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize:   '12px',
              color:      'var(--text-muted)',
            }}>
              This order was cancelled
            </p>
          </div>
        </div>
      ) : (
        STEPS.map((step, i) => {
          const isDone    = i < currentIdx
          const isCurrent = i === currentIdx
          const isLast    = i === STEPS.length - 1

          const dotColor  = isDone || isCurrent ? '#3DBA6F' : 'transparent'
          const lineColor = isDone ? '#3DBA6F' : 'var(--border)'
          const labelColor =
            isCurrent ? '#3DBA6F'       :
            isDone    ? 'var(--text-primary)'  :
                        'var(--text-muted)'

          return (
            <div key={step.key} style={{ display: 'flex', gap: '16px' }}>
              {/* ── Dot + line column ── */}
              <div style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                flexShrink:    0,
              }}>
                {/* Dot */}
                <div style={{
                  position:     'relative',
                  width:        '14px',
                  height:       '14px',
                  borderRadius: '50%',
                  background:   dotColor,
                  border:       isDone || isCurrent
                    ? 'none'
                    : '1.5px solid rgba(255,255,255,0.2)',
                  flexShrink:   0,
                  marginTop:    '3px',
                  /* Pulse ring on active step */
                  boxShadow:    isCurrent
                    ? '0 0 0 4px rgba(201,168,76,0.18)'
                    : 'none',
                  transition:   'box-shadow 0.3s ease',
                }} />

                {/* Connecting line */}
                {!isLast && (
                  <div style={{
                    width:      '1.5px',
                    flexGrow:   1,
                    minHeight:  '36px',
                    background: lineColor,
                    transition: 'background 0.4s ease',
                    margin:     '4px 0',
                  }} />
                )}
              </div>

              {/* ── Label column ── */}
              <div style={{ paddingBottom: isLast ? 0 : '28px' }}>
                <p style={{
                  margin:        0,
                  fontFamily:    'var(--font-display)',
                  fontSize:      '15px',
                  letterSpacing: '0.08em',
                  color:         labelColor,
                  transition:    'color 0.3s ease',
                }}>
                  {step.label}
                </p>
                <p style={{
                  margin:     '3px 0 0',
                  fontFamily: 'var(--font-body)',
                  fontSize:   '12px',
                  color:      'var(--text-muted)',
                  lineHeight: 1.4,
                }}>
                  {step.sub}
                </p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
