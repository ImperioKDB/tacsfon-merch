'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
interface Props { orderId: string; onClose: () => void }
export default function ProofModal({ orderId, onClose }: Props) {
  const [url, setUrl]         = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiFetch<{ signed_url: string }>(`/admin/orders/${orderId}/proof`)
      .then(d => setUrl(d.signed_url))
      .catch(err => { toast.error(err instanceof ApiError ? err.message : 'Could not load proof.'); onClose() })
      .finally(() => setLoading(false))
  }, [orderId, onClose])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '520px', maxWidth: '95vw', background: 'var(--color-surface)', border: '1px solid var(--color-border)', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-inter)', color: 'var(--color-text-primary)' }}>Payment Proof</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}><X size={18} strokeWidth={1.5} /></button>
        </div>
        <div style={{ padding: '16px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading
            ? <div className="animate-pulse" style={{ width: '100%', height: '300px', background: 'var(--color-surface-2)' }} />
            : url ? <div style={{ position: 'relative', width: '100%', height: '400px' }}><Image src={url} alt="Payment proof" fill className="object-contain" /></div> : null}
        </div>
      </div>
    </div>
  )
}