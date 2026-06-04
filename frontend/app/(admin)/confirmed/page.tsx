'use client'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Truck } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
interface OrderRow { id: string; customer_name: string | null; total: number; created_at: string; user: { full_name: string; email: string } | null; order_items: { id: string }[] }
export default function ConfirmedOrdersPage() {
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [acting, setActing]   = useState<string | null>(null)
  async function doDispatch(id: string) {
    setActing(id)
    try { await apiFetch(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'dispatched' }) }); toast.success('Marked dispatched.'); setOrders(p => p.filter(o => o.id !== id)) }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed.') }
    finally { setActing(null); setConfirm(null) }
  }
  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await apiFetch<{ orders: OrderRow[] }>('/admin/orders?status=confirmed&limit=50'); setOrders(d.orders) }
    catch { toast.error('Failed to load.') } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const columns: Column<OrderRow>[] = [
    { key: 'id',   label: 'Order ID', render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer', render: r => r.user?.full_name ?? r.customer_name ?? '—' },
    { key: 'item', label: 'Items',    render: r => `${r.order_items.length} item(s)` },
    { key: 'tot',  label: 'Total',    render: r => formatPrice(r.total) },
    { key: 'date', label: 'Date',     render: r => formatDate(r.created_at) },
    { key: 'act', label: 'Actions', render: r => (
      <button onClick={() => setConfirm(r.id)} disabled={acting === r.id}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'transparent', border: '1px solid var(--accent)', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
        <Truck size={13} strokeWidth={1.5} />Mark Dispatched
      </button>
    )},
  ]
  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', marginBottom: '4px' }}>Confirmed Orders</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '24px' }}>Payment confirmed — ready to dispatch</p>
      <AdminTable columns={columns} rows={orders} loading={loading} emptyMessage="No confirmed orders." />
      {confirm && <ConfirmDialog title="Mark as Dispatched?" message="Student will be notified their order is on the way." confirmLabel="Mark Dispatched" variant="default" onConfirm={() => doDispatch(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  )
}