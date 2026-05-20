'use client'

import Link               from 'next/link'
import { ChevronRight }   from 'lucide-react'
import type { Order, OrderStatus } from '@/types'

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus | 'pending_payment' | 'payment_submitted' | 'cancelled', {
  label: string
  bg:    string
  color: string
}> = {
  pending_payment:    { label: 'Awaiting Payment', bg: '#78350f26', color: '#F59E0B' },
  payment_submitted:  { label: 'Proof Submitted',  bg: '#1e3a5f26', color: '#60A5FA' },
  pending:            { label: 'Pending',           bg: '#78350f26', color: '#F59E0B' },
  confirmed:          { label: 'Confirmed',         bg: '#1e3a5f26', color: '#60A5FA' },
  dispatched:         { label: 'Dispatched',        bg: '#3b1f6126', color: '#A78BFA' },
  received:           { label: 'Received',          bg: '#05422126', color: '#34D399' },
  cancelled:          { label: 'Cancelled',         bg: '#3f1f1f26', color: '#F87171' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function naira(n: number) {
  return `₦${n.toLocaleString('en-NG')}`
}

function itemSummary(order: Order): string {
  const items = order.items ?? []
  if (!items.length) return 'No items'
  const first = items[0].variant?.product?.name ?? 'Item'
  if (items.length === 1) return first
  return `${first} + ${items.length - 1} more`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrderCard({ order }: { order: Order }) {
  const shortId = order.id.slice(0, 8).toUpperCase()

  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex items-center gap-4 p-4 rounded-2xl transition-all
                 hover:border-[var(--color-gold)] group"
      style={{
        background: 'var(--color-surface)',
        border:     '1px solid var(--color-border)',
        display:    'flex',
      }}
    >
      {/* Left: order info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-bold font-mono"
            style={{ color: 'var(--color-text-primary)' }}
          >
            #{shortId}
          </span>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {itemSummary(order)}
        </p>

        <div className="flex items-center gap-3">
          <span
            className="text-xs"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            {formatDate(order.created_at)}
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--color-gold)' }}
          >
            {naira(order.total)}
          </span>
        </div>
      </div>

      {/* Right: arrow */}
      <ChevronRight
        size={18}
        className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: 'var(--color-text-disabled)' }}
      />
    </Link>
  )
}