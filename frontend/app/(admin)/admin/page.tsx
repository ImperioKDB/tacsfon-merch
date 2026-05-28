'use client'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Eye, CheckCircle, Truck, PackageCheck, AlertTriangle } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import ProofModal from '@/components/admin/ProofModal'

type TabState = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'dispatched';

interface OrderRow { 
  id: string; customer_name: string | null; total: number; created_at: string; status: string; payment_status: string; proof_url: string | null;
  user: { full_name: string; email: string } | null; order_items: { id: string; quantity: number; product_variant: { product: { name: string } | null } | null }[] 
}

export default function OrderPipelinePage() {
  const [orders, setOrders]   = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabState>('payment_submitted') 
  const [proofId, setProofId] = useState<string | null>(null)
  
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null)
  const [markIncompleteId, setMarkIncompleteId] = useState<string | null>(null)
  const [dispatchId, setDispatchId] = useState<string | null>(null)
  const [acting, setActing]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { 
      let url = '/admin/orders?limit=100';
      if (activeTab === 'pending_payment') url += '&status=pending_payment';
      else if (activeTab === 'payment_submitted') url += '&status=payment_submitted';
      else if (activeTab === 'confirmed') url += '&status=confirmed';
      else if (activeTab === 'dispatched') url += '&status=dispatched';
      
      const d = await apiFetch<{ orders: OrderRow[] }>(url); 
      setOrders(d.orders) 
    }
    catch { toast.error('Failed to load orders pipeline.') } finally { setLoading(false) }
  }, [activeTab])
  
  useEffect(() => { load() }, [load])

  async function handleConfirmPayment(orderId: string) {
    setActing(orderId);
    try {
      await apiFetch(`/admin/orders/${orderId}/payment`, { method: 'PATCH', body: JSON.stringify({ payment_status: 'paid' }) })
      toast.success('Payment verified! Order moved to Confirmed.');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Action failed.') }
    finally { setActing(null); setConfirmPaymentId(null); }
  }

  async function handleMarkIncomplete(orderId: string) {
    setActing(orderId);
    try {
      await apiFetch(`/admin/orders/${orderId}/payment`, { method: 'PATCH', body: JSON.stringify({ payment_status: 'incomplete' }) })
      toast.info('Order marked incomplete. Student notified.');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Action failed.') }
    finally { setActing(null); setMarkIncompleteId(null); }
  }

  async function handleDispatch(orderId: string) {
    setActing(orderId);
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'dispatched' }) })
      toast.success('Order dispatched! Student notified.');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Action failed.') }
    finally { setActing(null); setDispatchId(null); }
  }

  const btn = "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all disabled:opacity-50 min-w-[120px]";

  const columns: Column<OrderRow>[] = [
    { key: 'id',   label: 'ID',  render: r => formatOrderId(r.id) },
    { key: 'cust', label: 'Customer',  render: r => r.user?.full_name ?? r.customer_name ?? '—' },
    { key: 'item', label: 'Items',     render: r => <span className="text-zinc-500 font-bold">{r.order_items.length} item(s)</span> },
    { key: 'tot',  label: 'Total',     render: r => <span className="text-gold font-bold">{formatPrice(r.total)}</span> },
    { key: 'date', label: 'Placed On', render: r => formatDate(r.created_at) },
    { key: 'act',  label: 'Pipeline Action',   render: r => (
      <div className="flex gap-2 flex-wrap min-w-[300px]">
        {activeTab === 'payment_submitted' && (
          <>
            <button onClick={() => setProofId(r.id)} className={`${btn} text-zinc-300 border-zinc-700 hover:bg-zinc-800`}><Eye size={14} /> View Proof</button>
            <button onClick={() => setConfirmPaymentId(r.id)} disabled={acting === r.id} className={`${btn} text-green-400 border-green-900 bg-green-950/30 hover:bg-green-900/80`}><CheckCircle size={14} /> Confirm</button>
            <button onClick={() => setMarkIncompleteId(r.id)} disabled={acting === r.id} className={`${btn} text-red-500 border-red-900 bg-red-950/20 hover:bg-red-950/50`}><AlertTriangle size={14} /> Reject</button>
          </>
        )}
        {activeTab === 'confirmed' && (
          <button onClick={() => setDispatchId(r.id)} disabled={acting === r.id} className={`${btn} text-gold border-gold bg-gold/10 hover:bg-gold hover:text-black`}><Truck size={14} /> Mark Dispatched</button>
        )}
        {activeTab === 'pending_payment' && (
          <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Awaiting Student Upload</span>
        )}
        {activeTab === 'dispatched' && (
          <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-1"><PackageCheck size={14}/> In Transit</span>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1400px]">
      <div>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Order Pipeline</h1>
        <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] mt-2">STREAMLINED FULFILLMENT MATRIX</p>
      </div>

      <div className="flex overflow-x-auto border-b border-zinc-800 pb-px hide-scrollbar">
        {[
          { id: 'payment_submitted', label: 'To Verify' },
          { id: 'confirmed', label: 'To Dispatch' },
          { id: 'dispatched', label: 'In Transit' },
          { id: 'pending_payment', label: 'Awaiting Proof' },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as TabState)}
            className={`px-8 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2
              ${activeTab === t.id ? 'border-gold text-gold bg-gold/5' : 'border-transparent text-zinc-500 hover:text-white hover:bg-zinc-900/50'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden">
        <AdminTable columns={columns} rows={orders} loading={loading} emptyMessage={`No orders in this stage.`} />
      </div>

      {proofId && <ProofModal orderId={proofId} onClose={() => setProofId(null)} />}
      
      {confirmPaymentId && <ConfirmDialog title="Verify Payment" message="This confirms the bank transfer is received. The student will be notified and the order will move to Confirmed." confirmLabel="Verify & Confirm" onConfirm={() => handleConfirmPayment(confirmPaymentId)} onCancel={() => setConfirmPaymentId(null)} />}
      
      {markIncompleteId && <ConfirmDialog title="Reject Payment Proof" message="This marks the payment as incomplete. The student will be notified to contact support." confirmLabel="Reject Proof" variant="danger" onConfirm={() => handleMarkIncomplete(markIncompleteId)} onCancel={() => setMarkIncompleteId(null)} />}
      
      {dispatchId && <ConfirmDialog title="Dispatch Order" message="This marks the order as shipped. The student will be notified it is on the way." confirmLabel="Mark as Dispatched" onConfirm={() => handleDispatch(dispatchId)} onCancel={() => setDispatchId(null)} />}
    </div>
  )
}
