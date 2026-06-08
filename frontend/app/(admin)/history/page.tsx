'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast }                             from 'sonner'
import { apiFetch }                          from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'

const A = '#5B8CFF'
const ACCENT = '#5B8CFF'

interface OrderRow {
  id: string; customer_name: string | null; total: number
  created_at: string; delivery_address?: string | null
  user: { full_name: string; email: string } | null
  order_items: { id: string }[]
}

function Detail({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: small ? '11px' : '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{value}</p>
    </div>
  )
}

export default function Page() {
  const [orders,  setOrders]  = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch<any>('/admin/orders?status=&limit=100')
      setOrders(res.orders ?? [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>
              Order History
            </h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              All orders across all statuses
            </p>
          </div>
          {!loading && (
            <span style={{ padding: '4px 12px', background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, color: ACCENT, fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '140px', background: 'var(--bg-surface)', border: '1px solid var(--border)', animation: 'admin-pulse 1.4s infinite' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '56px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>No orders here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map(o => {
            const name  = o.user?.full_name ?? o.customer_name ?? '—'
            const count = o.order_items?.length ?? 0
            return (
              <div key={o.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '2px', background: ACCENT }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: A, letterSpacing: '0.06em' }}>{formatOrderId(o.id)}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{formatPrice(o.total)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: '8px' }}>
                    <Detail label="Customer" value={name} />
                    <Detail label="Items"    value={`${count} item${count !== 1 ? 's' : ''}`} />
                    <Detail label="Email"    value={o.user?.email ?? '—'} small />
                    <Detail label="Date"     value={formatDate(o.created_at)} />
                  </div>
                  {o.delivery_address && (
                    <div style={{ padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 3px' }}>Delivery Address</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{o.delivery_address}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <style>{`@keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}
