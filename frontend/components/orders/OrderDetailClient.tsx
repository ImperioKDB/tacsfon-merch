'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Home } from 'lucide-react'
import { apiFetch } from '@/lib/api/fetch'
import { resolveImageUrl } from '@/lib/utils/formatters'
import StatusTimeline from './StatusTimeline'
import MarkReceivedDialog from './MarkReceivedDialog'

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showReceive, setShowReceive] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await apiFetch<any>(`/orders/${orderId}`)
      setOrder(res.data || res)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[10px] font-black text-zinc-800 italic tracking-[0.5em]">DECRYPTING_MANIFEST...</div>
  if (!order) return <div className="min-h-screen bg-black flex items-center justify-center font-display text-xl text-red-900 uppercase">MANIFEST_NOT_FOUND</div>

  return (
    <main className="min-h-screen bg-[#050505] text-[#F5F0E8] pt-20 pb-32 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <Link href="/orders" className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-colors">BACK</Link>
          <Link href="/" className="text-[9px] font-black uppercase tracking-[0.4em] text-[#3DBA6F] hover:text-white transition-colors">STOREFRONT</Link>
        </div>

        <div className="space-y-4">
          <p className="font-mono text-[10px] text-zinc-700 tracking-tighter uppercase italic">SHIPMENT_FILE // {order.id.toUpperCase()}</p>
          <h1 className="font-display text-[32px] leading-none uppercase tracking-tighter italic">
            Order <span className="text-[#3DBA6F]">Manifest.</span>
          </h1>
          <StatusTimeline status={order.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7 space-y-6">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 italic border-l-2 border-[#3DBA6F] pl-3">Inventory_Contents</p>
            <div className="divide-y divide-white/5 border-y border-white/5 bg-[#080808]">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-5 flex gap-5 items-center">
                  <div className="relative w-12 h-16 bg-[#111] overflow-hidden border border-white/5 shrink-0">
                    <Image src={resolveImageUrl(item.variant?.product?.image_url) || ''} alt="merch" fill className="object-cover grayscale" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base uppercase tracking-wider text-white leading-none mb-1">{item.variant?.product?.name}</h3>
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{item.variant?.size} / {item.variant?.color}</p>
                  </div>
                  <p className="font-mono text-[10px] text-white">x{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 space-y-8">
            <section className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 italic border-l-2 border-zinc-800 pl-3">Financials</p>
              <div className="bg-[#3DBA6F] text-black p-5">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">TOTAL_PAID_SECURE</p>
                <p className="text-3xl font-display leading-none tracking-tighter">₦{order.total.toLocaleString()}</p>
              </div>
            </section>
            {order.status === 'dispatched' && (
              <button onClick={() => setShowReceive(true)} className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#3DBA6F] transition-all">
                Mark as Received
              </button>
            )}
          </div>
        </div>
      </div>
      {showReceive && <MarkReceivedDialog orderId={orderId} onSuccess={() => { setShowReceive(false); fetchOrder(); }} onCancel={() => setShowReceive(false)} />}
    </main>
  )
}