'use client'
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
interface OR { id: string; customer_name: string | null; total: number; created_at: string; user: { full_name: string; email: string } | null }
export default function ReceiptsPage() {
  const [orders, setOrders]   = useState<OR[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { apiFetch<{ orders: OR[] }>('/admin/orders?payment_status=paid&limit=100').then(d=>setOrders(d.orders)).catch(()=>toast.error('Failed.')).finally(()=>setLoading(false)) }, [])
  async function view(id: string) {
    try { const d = await apiFetch<{ signed_url: string }>(`/admin/orders/${id}/receipt`); window.open(d.signed_url,'_blank','noopener,noreferrer') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Could not load receipt.') }
  }
  const columns: Column<OR>[] = [
    {key:'id',   label:'Order ID', render:r=>formatOrderId(r.id)},
    {key:'cust', label:'Customer', render:r=>r.user?.full_name??r.customer_name??'—'},
    {key:'date', label:'Date',     render:r=>formatDate(r.created_at)},
    {key:'tot',  label:'Amount',   render:r=>formatPrice(r.total)},
    {key:'act',  label:'Actions',  render:r=><button onClick={()=>view(r.id)} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'transparent',border:'1px solid var(--border)',cursor:'pointer',color:'var(--text-muted)',fontSize:'0.75rem',fontFamily:'var(--font-body)'}}><ExternalLink size={13} strokeWidth={1.5}/>View Receipt</button>},
  ]
  return (
    <div>
      <h1 style={{fontSize:'1.375rem',fontWeight:700,fontFamily:'var(--font-body)',color:'var(--text-primary)',marginBottom:'24px'}}>Receipts</h1>
      <AdminTable columns={columns} rows={orders} loading={loading} emptyMessage="No paid orders with receipts yet." />
    </div>
  )
}