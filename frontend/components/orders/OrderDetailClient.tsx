'use client'

import { useCallback, useEffect, useState } from 'react'
import Link                                  from 'next/link'
import Image                                 from 'next/image'
import { ArrowLeft }                         from 'lucide-react'
import { StatusBadge }                       from './OrderCard'
import StatusTimeline                        from './StatusTimeline'
import MarkReceivedDialog                    from './MarkReceivedDialog'
import StepUploadProof                       from '@/components/checkout/StepUploadProof'
import { apiFetch }                          from '@/lib/api/fetch'
import { resolveImageUrl }                   from '@/lib/utils/formatters'
import type { Order }                        from '@/types'

type Props      = { orderId: string }
type LoadState  = 'loading' | 'ready' | 'error'

export default function OrderDetailClient({ orderId }: Props) {
  const [order,       setOrder]       = useState<Order | null>(null)
  const [loadState,   setLoadState]   = useState<LoadState>('loading')
  const [showReceive, setShowReceive] = useState(false)
  const [showUpload,  setShowUpload]  = useState(false)

  const fetchOrder = useCallback(async () => {
    setLoadState('loading')
    try {
      // apiFetch prepends NEXT_PUBLIC_API_URL and attaches auth token
      const data = await apiFetch<Order>(`/orders/${orderId}`)
      setOrder(data)
      setLoadState('ready')
    } catch {
      setLoadState('error')
    }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const showUploadBtn  = order?.status === 'pending_payment' && !order?.proof_url
  const showReceiveBtn = order?.status === 'dispatched'
  const showReceiptBtn = order?.status === 'received' && order?.payment_status === 'paid'

  const displayItems = (order as any)?.order_items ?? order?.items ?? []

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <main className="min-h-screen px-4 py-32 bg-[#0A0A0F]">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-4 w-24 animate-pulse bg-zinc-800" />
          <div className="h-48 animate-pulse bg-zinc-900 border border-zinc-800" />
          <div className="h-32 animate-pulse bg-zinc-900 border border-zinc-800" />
        </div>
      </main>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (loadState === 'error' || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#0A0A0F]">
        <div className="text-center space-y-6">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">
            Order Not Found
          </p>
          <Link
            href="/orders"
            className="inline-block bg-[#C9A84C] text-black px-8 py-3 font-black uppercase text-[10px] tracking-widest"
          >
            Return to Orders
          </Link>
        </div>
      </main>
    )
  }

  // ── Ready ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen px-4 py-24 md:px-8 bg-[#0A0A0F] text-[#F7F5F0]">
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">

        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to orders
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A84C] hover:text-white transition-colors"
          >
            Return Home
          </Link>
        </div>

        {/* Status header */}
        <div className="p-8 bg-[#13131A] border border-[#2A2A38] space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.3em] mb-2">
                Order ID
              </p>
              <h2 className="text-2xl font-black text-white font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </h2>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <StatusTimeline status={order.status} />
        </div>


        {/* Status notification */}
        {order.status === 'payment_submitted' && (
          <div className="px-6 py-4 bg-blue-950/40 border border-blue-800/50 text-blue-300 text-[10px] font-black uppercase tracking-widest">
            Payment proof received — awaiting admin verification
          </div>
        )}
        {order.status === 'confirmed' && (
          <div className="px-6 py-4 bg-amber-950/40 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-black uppercase tracking-widest">
            Payment confirmed — your order is being prepared
          </div>
        )}
        {order.status === 'dispatched' && (
          <div className="px-6 py-4 bg-green-950/40 border border-green-800/50 text-green-400 text-[10px] font-black uppercase tracking-widest">
            Order dispatched — ready for collection / out for delivery
          </div>
        )}
        {order.status === 'received' && (
          <div className="px-6 py-4 bg-green-950/40 border border-green-800/50 text-green-400 text-[10px] font-black uppercase tracking-widest">
            Order received — thank you!
          </div>
        )}
        {order.status === 'cancelled' && (
          <div className="px-6 py-4 bg-red-950/40 border border-red-800/50 text-red-400 text-[10px] font-black uppercase tracking-widest">
            This order has been cancelled
          </div>
        )}

        {/* Items */}
        {displayItems.length > 0 && (
          <div className="bg-black border border-[#2A2A38] overflow-hidden">
            <div className="p-4 border-b border-[#2A2A38] bg-[#13131A]/30">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Items
              </p>
            </div>
            <div className="divide-y divide-zinc-900">
              {displayItems.map((item: any, i: number) => {
                const img = resolveImageUrl(item.variant?.product?.image_url)
                return (
                  <div key={i} className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#0A0A0F] border border-[#2A2A38] overflow-hidden shrink-0">
                        {img && (
                          <Image
                            src={img}
                            alt="Merch"
                            width={64}
                            height={64}
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase">
                          {item.variant?.product?.name || 'TACSFON Item'}
                        </p>
                        <p className="text-[10px] font-black text-[#C9A84C] uppercase mt-1">
                          {item.variant?.size || 'Standard'} • {item.variant?.color || 'Default'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-mono font-bold text-white">
                      ₦{(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="p-6 bg-[#13131A] flex justify-between items-center border-t border-[#2A2A38]">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Total
              </span>
              <span className="text-2xl font-black text-[#C9A84C]">
                ₦{Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Delivery */}
        <div className="p-8 bg-[#13131A]/20 border border-[#2A2A38]">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">
            Delivery
          </p>
          <p className="text-white text-sm">
            {order.delivery_address || 'Collection at store'}
          </p>
          <p className="text-zinc-500 text-xs mt-2 font-mono">
            {order.phone || 'No contact provided'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4 pb-20">
          {showUploadBtn && (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full py-5 font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 transition-all"
              style={{ background: 'var(--color-gold)', color: '#000' }}
            >
              Upload Payment Proof
            </button>
          )}
          {showReceiveBtn && (
            <button
              onClick={() => setShowReceive(true)}
              className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-[#C9A84C] transition-all"
            >
              Mark as Received
            </button>
          )}
          {showReceiptBtn && (
            <Link
              href={`/orders/${orderId}/receipt`}
              className="block w-full py-5 border border-[#2A2A38] text-[#C9A84C] text-center font-black uppercase text-xs tracking-[0.2em] hover:bg-[#13131A] transition-all"
            >
              View Digital Receipt
            </Link>
          )}
        </div>
      </div>

      {/* Upload proof modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#13131A] border border-[#2A2A38] p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#2A2A38] pb-4">
              <h3 className="text-xl font-black text-white uppercase italic">
                Upload Proof
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <StepUploadProof orderId={orderId} />
          </div>
        </div>
      )}

      {/* Mark received dialog */}
      {showReceive && (
        <MarkReceivedDialog
          orderId={orderId}
          onSuccess={() => { setShowReceive(false); fetchOrder() }}
          onCancel={() => setShowReceive(false)}
        />
      )}
    </main>
  )
}
