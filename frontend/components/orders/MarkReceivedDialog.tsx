'use client'

/**
 * MarkReceivedDialog
 *
 * Modal that confirms the student received their order.
 * Calls PATCH /orders/[id]/received.
 *
 * Props:
 *   orderId   — the order UUID
 *   onSuccess — called after successful mark
 *   onCancel  — called when dismissed
 */

import { useState }   from 'react'
import { apiFetch }   from '@/lib/api/fetch'

interface Props {
  orderId:   string
  onSuccess: () => void
  onCancel:  () => void
}

export default function MarkReceivedDialog({ orderId, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      await apiFetch(`/orders/${orderId}/received`, { method: 'PATCH' })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to update order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onCancel}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(10,10,10,0.85)',
        backdropFilter:  'blur(4px)',
        zIndex:          50,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '16px',
      }}
    >
      {/* Modal panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:  'var(--bg-surface)',
          border:      '1px solid var(--border)',
          padding:     '32px 28px',
          maxWidth:    '400px',
          width:       '100%',
          fontFamily:  'var(--font-body)',
        }}
      >
        {/* Icon */}
        <div style={{
          width:       '44px',
          height:      '44px',
          border:      '1px solid var(--success)',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 style={{
          margin:        '0 0 8px',
          fontFamily:    'var(--font-display)',
          fontSize:      '20px',
          letterSpacing: '0.08em',
          color:         'var(--text-primary)',
        }}>
          CONFIRM RECEIPT
        </h2>

        <p style={{
          margin:     '0 0 28px',
          fontSize:   '13px',
          color:      'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          Confirm you have received your order. This action cannot be undone.
        </p>

        {error && (
          <p style={{
            margin:     '0 0 16px',
            fontSize:   '12px',
            color:      'var(--danger)',
          }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex:          1,
              minHeight:     '48px',
              background:    'none',
              border:        '1px solid var(--border)',
              color:         'var(--text-muted)',
              fontFamily:    'var(--font-body)',
              fontSize:      '12px',
              fontWeight:    600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor:        loading ? 'not-allowed' : 'pointer',
              opacity:       loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex:          1,
              minHeight:     '48px',
              background:    'var(--success)',
              border:        'none',
              color:         '#0A0A0A',
              fontFamily:    'var(--font-body)',
              fontSize:      '12px',
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor:        loading ? 'not-allowed' : 'pointer',
              opacity:       loading ? 0.7 : 1,
              transition:    'opacity 0.2s',
            }}
          >
            {loading ? 'Confirming…' : 'Yes, Received'}
          </button>
        </div>
      </div>
    </div>
  )
}
