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

interface Props { orderId: string }
type LoadState = 'loading' | 'ready' | 'error' | 'not_found'

function naira(n: number) { return `₦${n.toLocaleString('en-NG')}` }

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
        <div className="h-5 w-24" style={{ background: 'var(--color-surface-2)' }} />
        <div className="h-40"     style={{ background: 'var(--color-surface)' }} />
        <div className="h-24"     style={{ background: 'var(--color-surface)' }} />
        <div className="h-48"     style={{ background: 'var(--color-surface)' }} />
      </div>
    </main>
  )
}

export default function OrderDetailClient({ orderId }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [order,       setOrder]       = useState<Order | null>(null)
  const [loadState,   setLoadState]   = useState<LoadState>('loading')
  const [showReceive, setShowReceive] = useState(false)
  const [showUpload,  setShowUpload]  = useState(false)

  useEffect(() => {
    if (searchParams.get('proof') === 'pending') setShowUpload(true)
  }, [searchParams])

  const fetchOrder = useCallback(async () => {
    setLoadState('loading')
    try {
      const res  = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' })
      const body = await res.json()
      if (body?.success) { setOrder(body.data); setLoadState('ready') }
      else if (res.status === 404) setLoadState('not_found')
      else setLoadState('error')
    } catch { setLoadState('error') }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  if (loadState === 'loading') return <DetailSkeleton />

  if (loadState === 'not_found') return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Order not found</p>
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--color-gold)' }}>
          <ArrowLeft size={14} /> Back to My Orders
        </Link>
      </div>
    </main>
  )

  if (loadState === 'error' || !order) return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center space-y-4">
        <p style={{ color: 'var(--color-text-secondary)' }}>Failed to load order. Please try again.</p>
        <button onClick={fetchOrder} className="px-5 py-2.5 text-sm font-semibold" style={{ background: 'var(--color-gold)', color: '#000' }}>Retry</button>
      </div>
    </main>
  )

  const shortId  = order.id.slice(0, 8).toUpperCase()
  const items    = order.items ?? []
  const subtotal = items.reduce((s, it) => s + it.unit_price * it.quantity, 0)

  // CRITICAL FIX: Reverted 'pending' to 'pending_payment' to match DB status values
  const showUploadBtn  = (order.status === 'pending_payment') && !order.proof_url
  const showReceiveBtn = order.status === 'dispatched'
  const showReceiptBtn = order.status === 'received' && order.payment_status === 'paid'

  return (
    <>
      <main className="min-h-screen px-4 py-10 md:px-8" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-2xl mx-auto space-y-5">

          <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={14} /> My Orders
          </Link>

          <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <p className="text-lg font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>#{shortId}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>{formatDate(order.created_at)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <StatusTimeline status={order.status} />
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Items ({items.length})</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {items.map(item => {
                const name  = item.variant?.product?.name      ?? 'Product'
                const img   = item.variant?.product?.image_url ?? null
                const size  = item.variant?.size  ? ` / ${item.variant.size}`  : ''
                const color = item.variant?.color ? ` / ${item.variant.color}` : ''
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-14 h-14 flex-shrink-0 overflow-hidden" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                      {img
                        ? <Image src={img} alt={name} width={56} height={56} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">👕</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {`${size}${color}`.replace(' / ', '') || 'One Size'} &middot; Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{naira(item.unit_price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>{naira(item.unit_price)} each</p>}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-4 space-y-2 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{naira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Delivery</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-primary)' }}>Total</span>
                <span style={{ color: 'var(--color-gold)', fontSize: '1.1rem' }}>{naira(order.total)}</span>
              </div>
            </div>
          </div>

          {order.delivery_address && (
            <div className="p-5 space-y-1" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-disabled)' }}>Delivery Address</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{order.delivery_address}</p>
            </div>
          )}

          {showUploadBtn && (
            <button onClick={() => setShowUpload(true)} className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold hover:opacity-90" style={{ background: 'var(--color-gold)', color: '#000' }}>
              <Upload size={16} /> Upload Payment Proof
            </button>
          )}

          {showReceiveBtn && (
            <button onClick={() => setShowReceive(true)} className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold hover:opacity-90" style={{ background: 'var(--color-gold)', color: '#000' }}>
              📦 Mark as Received
            </button>
          )}

          {showReceiptBtn && (
            <Link href={`/orders/${order.id}/receipt`} className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold hover:opacity-90" style={{ background: 'var(--color-gold-muted)', color: 'var(--color-gold)', border: '1px solid var(--color-gold)', display: 'flex' }}>
              <Receipt size={16} /> View Receipt
            </Link>
          )}

        </div>
      </main>

      {showReceive && <MarkReceivedDialog orderId={order.id} onSuccess={() => { setShowReceive(false); fetchOrder() }} onCancel={() => setShowReceive(false)} />}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md">
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowUpload(false)} className="text-xs px-3 py-1.5" style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface)' }}>✕ Close</button>
            </div>
            <StepUploadProof orderId={order.id} />
          </div>
        </div>
      )}
    </>
  )
}
