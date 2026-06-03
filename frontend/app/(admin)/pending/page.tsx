'use client'

/**
 * /pending — Admin pending orders page
 *
 * Phase 10 — Lists all orders with status 'pending'.
 * Uses AdminTable. Clicking a row navigates to the order detail.
 */

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import AdminTable, { TableColumn } from '@/components/admin/AdminTable'

const ADMIN_ACCENT = '#5B8CFF'

interface Order {
  id:           string
  display_id:   string
  student_name: string
  total:        number
  item_count:   number
  created_at:   string
  payment_status: string
}

const COLUMNS: TableColumn[] = [
  { key: 'display_id',   label: 'Order',    sortable: true, width: '140px' },
  { key: 'student_name', label: 'Customer', sortable: true },
  { key: 'item_count',   label: 'Items',    sortable: true, align: 'center', width: '80px' },
  { key: 'total',        label: 'Total',    sortable: true, align: 'right',  width: '120px' },
  { key: 'payment_status', label: 'Payment', width: '130px' },
  { key: 'created_at',   label: 'Placed',   sortable: true, width: '160px' },
]

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const PAYMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  unpaid:     { bg: 'rgba(201,168,76,0.12)',  color: '#C9A84C', label: 'Unpaid'     },
  paid:       { bg: 'rgba(76,175,125,0.12)',  color: '#4CAF7D', label: 'Paid'       },
  incomplete: { bg: 'rgba(224,82,82,0.12)',   color: '#E05252', label: 'Incomplete' },
}

export default function PendingOrdersPage() {
  const router = useRouter()
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/admin/orders?status=pending', { credentials: 'include' })
        if (!res.ok) throw new Error(`Failed to load orders (${res.status})`)
        const json = await res.json()
        setOrders(json.data ?? json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  function renderCell(row: Order, key: string) {
    if (key === 'display_id') {
      return (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: ADMIN_ACCENT }}>
          #{(row.display_id ?? row.id).slice(-8).toUpperCase()}
        </span>
      )
    }
    if (key === 'total')        return <span style={{ color: '#C9A84C', fontWeight: 600 }}>{formatNaira(row.total)}</span>
    if (key === 'created_at')   return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{formatDate(row.created_at)}</span>
    if (key === 'item_count')   return <span style={{ color: 'var(--text-muted)' }}>{row.item_count}</span>
    if (key === 'payment_status') {
      const badge = PAYMENT_BADGE[row.payment_status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', label: row.payment_status }
      return (
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
          background: badge.bg, color: badge.color,
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
        }}>
          {badge.label}
        </span>
      )
    }
    return <span>{String((row as Record<string, unknown>)[key] ?? '—')}</span>
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: ADMIN_ACCENT, letterSpacing: '0.2em' }}>
          ORDERS
        </p>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
          PENDING
        </h1>
        {!loading && !error && (
          <p style={{ margin: '6px 0 0', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} awaiting confirmation
          </p>
        )}
      </div>

      {error ? (
        <div style={{
          padding: '16px 20px', background: 'rgba(224,82,82,0.08)',
          border: '1px solid rgba(224,82,82,0.2)', borderRadius: '6px',
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--danger)',
        }}>
          {error}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
          <AdminTable
            columns={COLUMNS}
            data={orders as unknown as Record<string, unknown>[]}
            renderCell={(row, key) => renderCell(row as unknown as Order, key)}
            onRowClick={row => router.push(`/admin/orders/${(row as unknown as Order).id}`)}
            loading={loading}
            rowKey={row => (row as unknown as Order).id}
            emptyState={
              <div style={{ padding: '48px 24px' }}>
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
                  ALL CLEAR
                </p>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No pending orders right now.
                </p>
              </div>
            }
          />
        </div>
      )}
    </div>
  )
}
