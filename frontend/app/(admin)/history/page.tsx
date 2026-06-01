'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'

const STATUSES = ['', 'pending_payment', 'payment_submitted', 'confirmed', 'dispatched', 'received', 'cancelled']

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    let url = '/admin/orders?limit=100'
    if (status) url += `&status=${status}`
    try {
      const d = await apiFetch<any>(url)
      setOrders(d.orders || [])
    } catch { } finally { setLoading(false) }
  }, [status])

  useEffect(() => { load() }, [load])

  const columns: Column<any>[] = [
    { key: 'id', label: 'ID', render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer', render: r => r.user?.full_name || '—' },
    { key: 'tot', label: 'Total', render: r => formatPrice(r.total) },
    { key: 'stat', label: 'Status', render: r => <span className="uppercase text-[10px] font-bold text-gold">{r.status.replace('_', ' ')}</span> },
    { key: 'date', label: 'Date', render: r => formatDate(r.created_at) }
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Order History</h1>
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-zinc-900 border border-zinc-800 p-3 text-xs font-bold text-zinc-400">
           <option value="">All Statuses</option>
           {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
        </select>
      </div>
      <AdminTable columns={columns} rows={orders} loading={loading} />
    </div>
  )
}
