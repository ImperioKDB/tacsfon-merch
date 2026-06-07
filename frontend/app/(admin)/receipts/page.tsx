'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Download, Loader2 }      from 'lucide-react'
import { toast }                             from 'sonner'
import { apiFetch }                          from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'

const A = '#5B8CFF'

export default function ReceiptsPage() {
  const [orders,    setOrders]    = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [fetching,  setFetching]  = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiFetch<any>('/admin/orders?status=confirmed&limit=100')
      const confirmed = (d.orders ?? []).filter((o: any) => o.payment_status === 'paid')
      setOrders(confirmed)
    } catch { toast.error('Failed to load receipts') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function openReceipt(orderId: string) {
    setFetching(orderId)
    try {
      const d = await apiFetch<any>(`/admin/orders/${orderId}/receipt`)
      window.open(d.signed_url, '_blank')
    } catch (err: any) { toast.error(err.message) }
    finally { setFetching(null) }
  }

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>Receipts</h1>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>All confirmed paid orders</p>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${A}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '64px', background: 'var(--bg-surface)', border: '1px solid var(--border)', animation: 'admin-pulse 1.4s infinite' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '56px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>No receipts yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2px', background: 'var(--border)' }}>
          {orders.map((o: any) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: 'var(--bg-surface)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <p style={{ margin: '0 0 2px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: A, letterSpacing: '0.06em' }}>{formatOrderId(o.id)}</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{o.user?.full_name ?? '—'}</p>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{formatPrice(o.total)}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(o.created_at)}</span>
              <button onClick={() => openReceipt(o.id)} disabled={fetching === o.id}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: `${A}12`, border: `1px solid ${A}40`, color: A, fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: fetching === o.id ? 'not-allowed' : 'pointer', opacity: fetching === o.id ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {fetching === o.id ? <Loader2 size={11} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> : <Download size={11} />}
                {fetching === o.id ? 'Loading…' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes admin-pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes admin-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
