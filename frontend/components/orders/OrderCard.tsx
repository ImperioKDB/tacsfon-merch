'use client'

import Link               from 'next/link'
import { ChevronRight }   from 'lucide-react'
import type { Order, OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; }> = {
  pending_payment:    { label: 'Awaiting Payment', bg: '#78350f26', color: '#F59E0B' },
  payment_submitted:  { label: 'Proof Submitted',  bg: '#1e3a5f26', color: '#60A5FA' },
  confirmed:          { label: 'Confirmed',         bg: '#1e3a5f26', color: '#60A5FA' },
  dispatched:         { label: 'Dispatched',        bg: '#3b1f6126', color: '#A78BFA' },
  received:           { label: 'Received',          bg: '#05422126', color: '#34D399' },
  cancelled:          { label: 'Cancelled',         bg: '#3f1f1f26', color: '#F87171' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status, bg: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function naira(n: number) {
  return `₦${n.toLocaleString('en-NG')}`
}

export default function OrderCard({ order }: { order: Order }) {
  const shortId = order.id.slice(0, 8).toUpperCase()

  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 p-4 rounded-2xl transition-all border border-zinc-800 hover:border-gold group bg-zinc-900/50"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold font-mono text-white">#{shortId}</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{formatDate(order.created_at)}</span>
          <span className="text-sm font-bold text-gold">{naira(order.total)}</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-zinc-700 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
