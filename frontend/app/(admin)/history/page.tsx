'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
interface OrderRow { id: string; customer_name: string | null; total: number; created_at: string; status: string; user: { full_name: string; email: string } | null; order_items: { id: string }[] }
interface PMeta { page: number; total_pages: number }
const STATUSES = ['','pending_payment','payment_submitted','confirmed','dispatched','received','cancelled']
const STATUS_COLORS: Record<string,string> = { pending_payment: 'var(--color-text-disabled)', payment_submitted: 'var(--color-warning)', confirmed: 'var(--color-gold)', dispatched: '#60a5fa', received: 'var(--color-success)', cancelled: 'var(--color-error)' }
export default function HistoryPage() {
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)
  const [meta, setMeta]       = useState<PMeta | null>(null)
  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page: String(p), limit: '20' })
      if (status) q.set('status', status)
      const d = await apiFetch<{ orders: OrderRow[]; pagination: PMeta }>(`/admin/orders?${q}`)
      setOrders(d.orders); setMeta(d.pagination); setPage(p)
    } catch { toast.error('Failed.') } finally { setLoading(false) }
  }, [status])
  useEffect(() => { load(1) }, [load])
  const filtered = search.trim() ? orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || (o.user?.full_name ?? o.customer_name ?? '').toLowerCase().includes(search.toLowerCase())) : orders
  const iStyle: React.CSSProperties = { padding: '9px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-inter)', outline: 'none' }
  const columns: Column<OrderRow>[] = [
    { key: 'id',   label: 'Order ID', render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer', render: r => r.user?.full_name ?? r.customer_name ?? '—' },
    { key: 'item', label: 'Items',    render: r => `${r.order_items.length} item(s)` },
    { key: 'tot',  label: 'Total',    render: r => formatPrice(r.total) },
    { key: 'stat', label: 'Status',   render: r => <span style={{ fontSize: '0.75rem', fontWeight: 600, color: STATUS_COLORS[r.status] ?? 'var(--color-text-primary)' }}>{r.status.replace(/_/g,' ').toUpperCase()}</span> },
    { key: 'date', label: 'Date',     render: r => formatDate(r.created_at) },
  ]
  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-urbanist)', color: 'var(--color-text-primary)', marginBottom: '20px' }}>All Orders</h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} strokeWidth={1.5} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
          <input type="text" placeholder="Search order ID or customer…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...iStyle, width: '100%', paddingLeft: '36px', boxSizing: 'border-box' }} />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace(/_/g,' ') : 'All statuses'}</option>)}
        </select>
      </div>
      <AdminTable columns={columns} rows={filtered} loading={loading} emptyMessage="No orders found." />
      {meta && meta.total_pages > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
          {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => load(p)} style={{ width: '36px', height: '36px', border: '1px solid', borderColor: p===page?'var(--color-gold)':'var(--color-border)', background: p===page?'var(--color-gold-muted)':'transparent', color: p===page?'var(--color-gold)':'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}