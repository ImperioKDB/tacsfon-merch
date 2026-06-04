'use client'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
interface OrderRow { id: string; customer_name: string | null; total: number; created_at: string; user: { full_name: string; email: string } | null; order_items: { id: string }[] }
export default function CompletedOrdersPage() {
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await apiFetch<{ orders: OrderRow[] }>('/admin/orders?status=received&limit=50'); setOrders(d.orders) }
    catch { toast.error('Failed to load.') } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const columns: Column<OrderRow>[] = [
    { key: 'id',   label: 'Order ID', render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer', render: r => r.user?.full_name ?? r.customer_name ?? '—' },
    { key: 'item', label: 'Items',    render: r => `${r.order_items.length} item(s)` },
    { key: 'tot',  label: 'Total',    render: r => formatPrice(r.total) },
    { key: 'date', label: 'Date',     render: r => formatDate(r.created_at) },
  ]
  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', marginBottom: '4px' }}>Completed Orders</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '24px' }}>Orders received by students</p>
      <AdminTable columns={columns} rows={orders} loading={loading} emptyMessage="No completed orders." />
    </div>
  )
}