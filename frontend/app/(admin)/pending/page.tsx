'use client'

/**
 * /pending — Admin pending orders page
 * Lists all orders with status 'pending_payment'.
 */

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import { apiFetch }            from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'

interface OrderRow {
  id:             string
  customer_name:  string | null
  total:          number
  created_at:     string
  payment_status: string
  user:           { full_name: string; email: string } | null
  order_items:    { id: string }[]
}

const PAYMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  unpaid:     { bg: 'rgba(61,186,111,0.10)',  color: 'var(--accent)',  label: 'Unpaid'     },
  paid:       { bg: 'rgba(76,175,125,0.12)',  color: 'var(--success)', label: 'Paid'       },
  incomplete: { bg: 'rgba(224,82,82,0.12)',   color: 'var(--danger)',  label: 'Incomplete' },
}

export default function PendingOrdersPage() {
  const router = useRouter()
  const [orders,  setOrders]  = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        // CORRECT: DB OrderStatus enum value is 'pending_payment', not 'pending'
        const d = await apiFetch<{ orders: OrderRow[] }>('/admin/orders?status=pending_payment&limit=100')
        setOrders(d.orders ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const columns: Column<OrderRow>[] = [
    { key: 'id',   label: 'Order ID',  render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer',  render: r => r.user?.full_name ?? r.customer_name ?? '—' },
    { key: 'item', label: 'Items',     render: r => `${r.order_items?.length ?? 0} item(s)` },
    { key: 'tot',  label: 'Total',     render: r => <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatPrice(r.total)}</span> },
    { key: 'pay',  label: 'Payment',   render: r => {
      const badge = PAYMENT_BADGE[r.payment_status] ?? { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', label: r.payment_status }
      return (
        <span style={{ background: badge.bg, color: badge.color, padding: '2px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {badge.label}
        </span>
      )
    }},
    { key: 'date', label: 'Placed',    render: r => formatDate(r.created_at) },
    { key: 'act',  label: '',          render: r => (
      <button
        onClick={() => router.push(`/admin?order=${r.id}`)}
        style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        Review
      </button>
    )},
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Pending Orders</h1>
          <p className="text-zinc-600 text-[10px] font-black tracking-[0.4em] uppercase mt-1">Awaiting Payment Submission</p>
        </div>
        <span style={{ background: 'rgba(61,186,111,0.10)', color: 'var(--accent)', padding: '4px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>
          {orders.length} ORDER{orders.length !== 1 ? 'S' : ''}
        </span>
      </div>
      {error && (
        <div style={{ background: 'rgba(224,82,82,0.10)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px', fontSize: '13px' }}>
          {error}
        </div>
      )}
      <AdminTable columns={columns} rows={orders} loading={loading} emptyMessage="No pending orders." />
    </div>
  )
}
