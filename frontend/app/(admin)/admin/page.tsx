'use client'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import ProofModal from '@/components/admin/ProofModal'
interface OrderRow { id: string; customer_name: string | null; total: number; created_at: string; user: { full_name: string; email: string } | null; order_items: { id: string; quantity: number; product_variant: { product: { name: string } | null } | null }[] }
const btn = (color: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-inter)', cursor: 'pointer', background: 'transparent', color, border: `1px solid ${color}` })
export default function PendingOrdersPage() {
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [proofId, setProofId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ id: string; type: 'paid' | 'incomplete' } | null>(null)
  const [acting, setActing]   = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await apiFetch<{ orders: OrderRow[] }>('/admin/orders?status=payment_submitted&limit=50'); setOrders(d.orders) }
    catch { toast.error('Failed to load orders.') } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  async function act(orderId: string, payment_status: 'paid' | 'incomplete') {
    setActing(orderId)
    try {
      await apiFetch(`/admin/orders/${orderId}/payment`, { method: 'PATCH', body: JSON.stringify({ payment_status }) })
      toast.success(payment_status === 'paid' ? 'Payment confirmed.' : 'Marked as incomplete.')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Action failed.') }
    finally { setActing(null); setConfirm(null) }
  }
  const columns: Column<OrderRow>[] = [
    { key: 'id',   label: 'Order ID',  render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer',  render: r => r.user?.full_name ?? r.customer_name ?? '—' },
    { key: 'item', label: 'Items',     render: r => <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{r.order_items.length} item(s)</span> },
    { key: 'tot',  label: 'Total',     render: r => formatPrice(r.total) },
    { key: 'date', label: 'Date',      render: r => formatDate(r.created_at) },
    { key: 'act',  label: 'Actions',   render: r => (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setProofId(r.id)} style={btn('var(--color-text-secondary)')}><Eye size={13} strokeWidth={1.5} />Proof</button>
        <button onClick={() => setConfirm({ id: r.id, type: 'paid' })} disabled={acting === r.id} style={btn('var(--color-success)')}><CheckCircle size={13} strokeWidth={1.5} />Confirm</button>
        <button onClick={() => setConfirm({ id: r.id, type: 'incomplete' })} disabled={acting === r.id} style={btn('var(--color-error)')}><XCircle size={13} strokeWidth={1.5} />Incomplete</button>
      </div>
    )},
  ]
  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-urbanist)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Pending Orders</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)', marginBottom: '24px' }}>Orders awaiting payment confirmation</p>
      <AdminTable columns={columns} rows={orders} loading={loading} emptyMessage="No pending orders — all caught up!" />
      {proofId && <ProofModal orderId={proofId} onClose={() => setProofId(null)} />}
      {confirm && <ConfirmDialog
        title={confirm.type === 'paid' ? 'Confirm Payment?' : 'Mark as Incomplete?'}
        message={confirm.type === 'paid' ? 'This will confirm the order and notify the student.' : 'This will notify the student that their payment is incomplete.'}
        confirmLabel={confirm.type === 'paid' ? 'Confirm Payment' : 'Mark Incomplete'}
        variant={confirm.type === 'paid' ? 'default' : 'danger'}
        onConfirm={() => act(confirm.id, confirm.type)} onCancel={() => setConfirm(null)} />}
    </div>
  )
}