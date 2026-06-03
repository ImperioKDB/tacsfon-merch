'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Home } from 'lucide-react'
import { apiFetch } from '@/lib/api/fetch'
import { resolveImageUrl } from '@/lib/utils/formatters'
import StatusTimeline from './StatusTimeline'
import type { Order } from '@/types'

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await apiFetch<any>(`/orders/${orderId}`)
      setOrder(res.data || res)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  if (loading) return <div className="min-h-screen bg-black" />
  if (!order) return <div className="text-white p-20 text-center font-display text-xl uppercase tracking-widest">MANIFEST_NOT_FOUND</div>

  return (
    <main className="min-h-screen bg-[#050505] text-[#F5F0E8] pt-20 pb-32 px-6">
      <div className="max-w-2xl mx-auto space-y-10">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <Link href="/orders" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft size={12} /> BACK
          </Link>
          <Link href="/" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#C9A84C] hover:text-white transition-colors">
             STOREFRONT <Home size={12} />
          </Link>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] text-zinc-600 tracking-tighter uppercase italic">LOGISTICS_FILE // {order.id.toUpperCase()}</p>
          <h1 className="font-display text-3xl leading-none uppercase tracking-tighter">
            Order <span className="text-[#C9A84C]">Manifest.</span>
          </h1>
          <StatusTimeline status={order.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-8 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Inventory_Contents</p>
            <div className="divide-y divide-white/5 border-y border-white/5">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="relative w-14 h-18 bg-[#111] overflow-hidden border border-white/5 shrink-0">
                    <Image src={resolveImageUrl(item.variant?.product?.image_url) || ''} alt="merch" fill className="object-cover grayscale" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg uppercase tracking-tight text-white leading-none mb-1">{item.variant?.product?.name}</h3>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.variant?.size} • {item.variant?.color}</p>
                  </div>
                  <p className="font-body text-xs font-bold text-[#F5F0E8]">₦{(item.unit_price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <section className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Destination</p>
              <p className="text-[11px] font-medium leading-relaxed text-zinc-400 uppercase tracking-wide">{order.delivery_address || 'Campus Collection'}</p>
            </section>
            <section className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Financials</p>
              <div className="bg-[#C9A84C] text-black p-4">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Amount Paid</p>
                <p className="text-2xl font-display leading-none">₦{order.total.toLocaleString()}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}