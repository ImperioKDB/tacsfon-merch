'use client'

import { useEffect } from 'react'
import { Loader2, Trash2 } from 'lucide-react'

interface Props {
  open:      boolean
  isLoading: boolean
  onConfirm: () => void
  onCancel:  () => void
}

export default function ClearCartDialog({ open, isLoading, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel} role="dialog" aria-modal="true"
      aria-labelledby="clear-dialog-title">
      <div className="relative w-full max-w-sm p-6 rounded-2xl border"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(217,79,79,0.12)' }}>
          <Trash2 size={22} style={{ color: 'var(--color-error)' }} />
        </div>

        <h3 id="clear-dialog-title" className="text-lg font-bold mb-2"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}>
          Clear your cart?
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          This will remove all items from your cart. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isLoading}
            className="flex-1 h-11 rounded-xl border text-sm font-semibold transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--color-error)', color: '#fff', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading
              ? <><Loader2 size={15} className="animate-spin" /> Clearing…</>
              : 'Yes, Clear Cart'
            }
          </button>
        </div>
      </div>
    </div>
  )
}