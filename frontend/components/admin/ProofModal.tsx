'use client'

import { useEffect }  from 'react'
import Image          from 'next/image'
import { X, ZoomIn } from 'lucide-react'

interface ProofModalProps {
  src?:    string | null   // optional — modal is a no-op when absent
  orderId: string
  onClose: () => void
}

export default function ProofModal({ src, orderId, onClose }: ProofModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!src) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Payment proof for order ${orderId}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 51,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: '600px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ZoomIn size={14} style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}
              >
                Payment Proof
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                #{orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close proof modal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Image */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
            <Image
              src={src}
              alt={`Payment proof for order ${orderId}`}
              fill
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>

          {/* Open in new tab */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--accent)',
                textDecoration: 'underline',
              }}
            >
              Open full image ↗
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
