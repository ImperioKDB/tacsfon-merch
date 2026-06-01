'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams }       from 'next/navigation'
import Link                                 from 'next/link'
import Image                                from 'next/image'
import { ArrowLeft, Receipt, Upload }       from 'lucide-react'
import { StatusBadge }                      from './OrderCard'
import StatusTimeline                       from './StatusTimeline'
import MarkReceivedDialog                   from './MarkReceivedDialog'
import StepUploadProof                      from '@/components/checkout/StepUploadProof'
import type { Order } from '@/types'

export default function OrderDetailClient({ orderId }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [order,       setOrder]       = useState<Order | null>(null)
  const [loadState,   setLoadState]   = useState('loading')
  const [showReceive, setShowReceive] = useState(false)
  const [showUpload,  setShowUpload]  = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const res  = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' })
      const body = await res.json()
      if (body?.success) { setOrder(body.data); setLoadState('ready') }
      else { setLoadState('error') }
    } catch { setLoadState('error') }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  if (loadState === 'loading') return <div className="min-h-screen bg-black" />

  const showUploadBtn  = (order?.status === 'pending_payment') && !order?.proof_url
  const showReceiveBtn = order?.status === 'dispatched'
  const showReceiptBtn = order?.status === 'received' && order?.payment_status === 'paid'

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/orders" className="flex items-center gap-2 text-zinc-500"><ArrowLeft size={16}/> Back</Link>
            <div className="p-6 bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white">Order #{order?.id.slice(0,8).toUpperCase()}</h2>
                    <StatusBadge status={order?.status || 'pending_payment'} />
                </div>
                <StatusTimeline status={order?.status || 'pending_payment'} />
            </div>

            {showUploadBtn && (
                <button onClick={() => setShowUpload(true)} className="w-full bg-gold text-black py-4 font-black uppercase text-xs">Upload Proof</button>
            )}
            
            {showUpload && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
                    <div className="w-full max-w-md bg-zinc-950 p-6 border border-zinc-800">
                        <button onClick={() => setShowUpload(false)} className="text-zinc-500 mb-4 text-xs">✕ Close</button>
                        <StepUploadProof orderId={orderId} />
                    </div>
                </div>
            )}
        </div>
    </main>
  )
}
