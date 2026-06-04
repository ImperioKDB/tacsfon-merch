'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { apiFetch } from '@/lib/api/fetch'

interface ProofModalProps {
  orderId: string
  onClose: () => void
  src?:    string | null // MADE OPTIONAL TO FIX BUILD ERROR
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
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <div className="relative max-w-lg w-full bg-[#0D0D0D] border border-white/5">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">PROOFS // {orderId.slice(0,8)}</p>
          <button onClick={onClose} className="text-white hover:text-[#3DBA6F] transition-colors"><X size={16}/></button>
        </div>
        <div className="aspect-[3/4] relative bg-black flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse text-[10px] font-black text-zinc-800 uppercase tracking-widest">WAKING_RENDER...</div>
          ) : url ? (
            <Image src={url} alt="Proof" fill className="object-contain" unoptimized />
          ) : (
            <div className="text-[10px] font-black text-red-900 uppercase">LOAD_FAILED</div>
          )}
        </div>
      </div>
    </div>
  )
}