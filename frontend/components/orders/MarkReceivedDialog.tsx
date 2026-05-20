'use client'

import { useState } from 'react'
import { PackageCheck } from 'lucide-react'

interface Props {
  orderId:   string
  onSuccess: () => void
  onCancel:  () => void
}

export default function MarkReceivedDialog({ orderId, onSuccess, onCancel }: Props) {
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setApiError(null)
    try {
      const res  = await fetch(`/api/orders/${orderId}/received`, { method: 'PATCH' })
      const body = await res.json()
      if (body?.success) {
        onSuccess()
      } else {
        setApiError(body?.error?.message ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setApiError('Connection issue. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-gold-muted)', border: '1px solid var(--color-gold)' }}
          >
            <PackageCheck size={26} style={{ color: 'var(--color-gold)' }} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}
          >
            Confirm Receipt
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Confirm that you have physically received your order.
            This action cannot be undone.
          </p>
        </div>

        {/* Error */}
        {apiError && (
          <p className="text-xs text-center" style={{ color: 'var(--color-error)' }}>
            {apiError}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all
                       hover:opacity-80 disabled:opacity-40"
            style={{
              background:  'var(--color-surface-2)',
              color:       'var(--color-text-secondary)',
              border:      '1px solid var(--color-border)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all
                       hover:opacity-90 active:scale-[.98] disabled:opacity-60"
            style={{ background: 'var(--color-gold)', color: '#000' }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Confirming…
                </span>
              : 'Yes, I received it'
            }
          </button>
        </div>
      </div>
    </div>
  )
}