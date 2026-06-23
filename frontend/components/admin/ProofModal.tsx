'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { apiFetch } from '@/lib/api/fetch'

interface ProofModalProps {
  orderId: string
  onClose: () => void
  src?:    string | null
}

export default function ProofModal({ src: propSrc, orderId, onClose }: ProofModalProps) {
  const [url, setUrl] = useState<string | null>(propSrc || null)
  const [loading, setLoading] = useState(!propSrc)

  useEffect(() => {
    if (!propSrc) {
      apiFetch<{ signed_url: string }>(`/admin/orders/${orderId}/proof`)
        .then(d => setUrl(d.signed_url))
        .finally(() => setLoading(false))
    }
  }, [orderId, propSrc])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
    }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '512px', background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{
            fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.3em', color: 'var(--text-muted)', margin: 0
          }}>
            PROOFS // {orderId.slice(0,8)}
          </p>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = '#ffffff'}
          >
            <X size={16}/>
          </button>
        </div>
        <div style={{ position: 'relative', aspectRatio: '3/4', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              LOADING...
            </div>
          ) : url ? (
            <Image src={url} alt="Proof" fill style={{ objectFit: 'contain' }} unoptimized />
          ) : (
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 900, color: 'var(--danger)', textTransform: 'uppercase' }}>
              LOAD_FAILED
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
