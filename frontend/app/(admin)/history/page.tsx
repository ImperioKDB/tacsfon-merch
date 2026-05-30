'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'

// AUDIT #17: Sync statuses with backend enums
const STATUSES = ['', 'pending', 'confirmed', 'dispatched', 'received', 'cancelled']

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)
  const [status, setStatus] = useState('')

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page: String(p), limit: '20' })
      if (status) q.set('status', status)
      const d = await apiFetch<any>(`/admin/orders?${q}`)
      setOrders(d.orders); setMeta(d.pagination); setPage(p)
    } catch { toast.error('Failed to sync history') } finally { setLoading(false) }
  }, [status])

  useEffect(() => { load(1) }, [load])

  // AUDIT #18: Windowed Pagination Logic
  const renderPagination = () => {
    if (!meta || meta.total_pages <= 1) return null
    const pages = []
    const total = meta.total_pages
    
    let start = Math.max(1, page - 2)
    let end = Math.min(total, page + 2)

    if (start > 1) pages.push(1)
    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total - 1) pages.push('...')
    if (end < total) pages.push(total)

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <button disabled={page === 1} onClick={() => load(page - 1)} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"><ChevronLeft/></button>
        {pages.map((p, i) => (
            typeof p === 'number' ? (
                <button key={i} onClick={() => load(p)} className={`w-10 h-10 font-bold text-xs ${page === p ? 'bg-gold text-black' : 'text-zinc-500 border border-zinc-900'}`}>{p}</button>
            ) : <span key={i} className="text-zinc-700">...</span>
        ))}
        <button disabled={page === total} onClick={() => load(page + 1)} className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"><ChevronRight/></button>
      </div>
    )
  }

  const columns: Column<any>[] = [
    { key: 'id', label: 'ID', render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer', render: r => r.user?.full_name || r.customer_name || '—' },
    { key: 'tot', label: 'Total', render: r => <span className="text-gold font-bold">{formatPrice(r.total)}</span> },
    { key: 'stat', label: 'Status', render: r => <span className="uppercase text-[9px] font-black">{r.status}</span> },
    { key: 'date', label: 'Date', render: r => formatDate(r.created_at) }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Order History</h1>
         <select value={status} onChange={e => setStatus(e.target.value)} className="bg-zinc-900 border border-zinc-800 p-2 text-xs font-bold text-zinc-400 outline-none">
            <option value="">Filter: All Statuses</option>
            {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
         </select>
      </div>
      <div className="bg-zinc-950 border border-zinc-800">
        <AdminTable columns={columns} rows={orders} loading={loading} />
      </div>
      {renderPagination()}
    </div>
  )
}
