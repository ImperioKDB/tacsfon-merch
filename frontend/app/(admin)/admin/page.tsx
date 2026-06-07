'use client'

/**
 * Admin Dashboard — Order Pipeline
 *
 * Redesigned to match the TACSFON design system:
 *   - All styling via inline CSS + CSS vars (no broken Tailwind classes)
 *   - Action buttons: full loading state with spinner + disabled lock
 *   - Admin accent: #5B8CFF (blue) — distinct from storefront green
 *   - Typography: var(--font-display), var(--font-body), var(--font-mono)
 */

import { useEffect, useState, useCallback } from 'react'
import { toast }                             from 'sonner'
import { Eye, CheckCircle, Truck, PackageCheck, AlertTriangle, Loader2 } from 'lucide-react'
import { apiFetch, ApiError }               from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import AdminTable, { type Column }          from '@/components/admin/AdminTable'
import ConfirmDialog                        from '@/components/admin/ConfirmDialog'
import ProofModal                           from '@/components/admin/ProofModal'

/* Admin design tokens */
const A  = '#5B8CFF'         /* admin accent blue */
const A_DIM = 'rgba(91,140,255,0.1)'

type TabState = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'dispatched'

interface OrderRow {
  id:             string
  customer_name:  string | null
  total:          number
  created_at:     string
  status:         string
  payment_status: string
  proof_url:      string | null
  user:           { full_name: string; email: string } | null
  order_items:    { id: string; quantity: number; product_variant: { product: { name: string } | null } | null }[]
}

const TABS = [
  { id: 'payment_submitted', label: 'To Verify',      color: '#60A5FA' },
  { id: 'confirmed',         label: 'To Dispatch',    color: '#2DD4BF' },
  { id: 'dispatched',        label: 'In Transit',     color: '#C084FC' },
  { id: 'pending_payment',   label: 'Awaiting Proof', color: '#C9A84C' },
]

/* ── Action button ── */
function ActionBtn({
  onClick, disabled, loading, color, bg, border, children,
}: {
  onClick:  () => void
  disabled: boolean
  loading:  boolean
  color:    string
  bg:       string
  border:   string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '6px',
        padding:        '7px 14px',
        fontFamily:     'var(--font-body)',
        fontSize:       '10px',
        fontWeight:     700,
        letterSpacing:  '0.1em',
        textTransform:  'uppercase',
        color:          disabled ? 'var(--text-muted)' : color,
        background:     disabled ? 'transparent' : bg,
        border:         `1px solid ${disabled ? 'var(--border)' : border}`,
        cursor:         disabled || loading ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.4 : 1,
        transition:     'all 150ms ease',
        whiteSpace:     'nowrap',
        minWidth:       '110px',
      }}
      onMouseEnter={e => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'
      }}
      onMouseLeave={e => {
        if (!disabled && !loading)
          (e.currentTarget as HTMLButtonElement).style.opacity = '1'
      }}
    >
      {loading
        ? <Loader2 size={12} style={{ animation: 'admin-spin 0.8s linear infinite' }} />
        : children
      }
      {!loading && <span>{disabled ? 'Wait…' : children}</span>}
    </button>
  )
}

export default function OrderPipelinePage() {
  const [orders,    setOrders]    = useState<OrderRow[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<TabState>('payment_submitted')
  const [proofId,   setProofId]   = useState<string | null>(null)

  const [confirmPaymentId,  setConfirmPaymentId]  = useState<string | null>(null)
  const [markIncompleteId,  setMarkIncompleteId]  = useState<string | null>(null)
  const [dispatchId,        setDispatchId]        = useState<string | null>(null)
  const [acting,            setActing]            = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/admin/orders?limit=100&status=${activeTab}`
      const d   = await apiFetch<{ orders: OrderRow[] }>(url)
      setOrders(d.orders ?? [])
    } catch {
      toast.error('Failed to load orders pipeline.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { load() }, [load])

  async function handleConfirmPayment(orderId: string) {
    setActing(orderId)
    try {
      await apiFetch(`/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        body:   JSON.stringify({ payment_status: 'paid' }),
      })
      toast.success('Payment verified — order moved to Confirmed.')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActing(null)
      setConfirmPaymentId(null)
    }
  }

  async function handleMarkIncomplete(orderId: string) {
    setActing(orderId)
    try {
      await apiFetch(`/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        body:   JSON.stringify({ payment_status: 'incomplete' }),
      })
      toast.info('Order marked incomplete. Student notified.')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActing(null)
      setMarkIncompleteId(null)
    }
  }

  async function handleDispatch(orderId: string) {
    setActing(orderId)
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body:   JSON.stringify({ status: 'dispatched' }),
      })
      toast.success('Order dispatched — student notified.')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActing(null)
      setDispatchId(null)
    }
  }

  const columns: Column<OrderRow>[] = [
    {
      key: 'id', label: 'Order ID',
      render: r => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {formatOrderId(r.id)}
        </span>
      ),
    },
    {
      key: 'cust', label: 'Customer',
      render: r => (
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
            {r.user?.full_name ?? r.customer_name ?? '—'}
          </p>
          {r.user?.email && (
            <p style={{ margin: '1px 0 0', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
              {r.user.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'item', label: 'Items',
      render: r => (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
          {r.order_items.length} item{r.order_items.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'tot', label: 'Total',
      render: r => (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
          {formatPrice(r.total)}
        </span>
      ),
    },
    {
      key: 'date', label: 'Placed',
      render: r => (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {formatDate(r.created_at)}
        </span>
      ),
    },
    {
      key: 'act', label: 'Action',
      render: r => {
        const isActing = acting === r.id
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {activeTab === 'payment_submitted' && (
              <>
                {/* View proof */}
                <button
                  onClick={() => setProofId(r.id)}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            '5px',
                    padding:        '7px 12px',
                    fontFamily:     'var(--font-body)',
                    fontSize:       '10px',
                    fontWeight:     700,
                    letterSpacing:  '0.1em',
                    textTransform:  'uppercase',
                    color:          'var(--text-muted)',
                    background:     'var(--bg-elevated)',
                    border:         '1px solid var(--border)',
                    cursor:         'pointer',
                    whiteSpace:     'nowrap',
                    transition:     'color 150ms, border-color 150ms',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.borderColor = A
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <Eye size={12} /> View Proof
                </button>

                {/* Confirm */}
                <button
                  onClick={() => setConfirmPaymentId(r.id)}
                  disabled={isActing}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            '5px',
                    padding:        '7px 14px',
                    fontFamily:     'var(--font-body)',
                    fontSize:       '10px',
                    fontWeight:     700,
                    letterSpacing:  '0.1em',
                    textTransform:  'uppercase',
                    color:          isActing ? 'var(--text-muted)' : '#4CAF7D',
                    background:     isActing ? 'transparent' : 'rgba(76,175,125,0.1)',
                    border:         `1px solid ${isActing ? 'var(--border)' : 'rgba(76,175,125,0.4)'}`,
                    cursor:         isActing ? 'not-allowed' : 'pointer',
                    opacity:        isActing ? 0.5 : 1,
                    whiteSpace:     'nowrap',
                    minWidth:       '90px',
                    transition:     'all 150ms',
                  }}
                >
                  {isActing
                    ? <Loader2 size={11} style={{ animation: 'admin-spin 0.8s linear infinite' }} />
                    : <CheckCircle size={11} />
                  }
                  {isActing ? 'Working…' : 'Confirm'}
                </button>

                {/* Reject */}
                <button
                  onClick={() => setMarkIncompleteId(r.id)}
                  disabled={isActing}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    gap:            '5px',
                    padding:        '7px 14px',
                    fontFamily:     'var(--font-body)',
                    fontSize:       '10px',
                    fontWeight:     700,
                    letterSpacing:  '0.1em',
                    textTransform:  'uppercase',
                    color:          isActing ? 'var(--text-muted)' : 'var(--danger)',
                    background:     isActing ? 'transparent' : 'rgba(224,82,82,0.08)',
                    border:         `1px solid ${isActing ? 'var(--border)' : 'rgba(224,82,82,0.3)'}`,
                    cursor:         isActing ? 'not-allowed' : 'pointer',
                    opacity:        isActing ? 0.5 : 1,
                    whiteSpace:     'nowrap',
                    minWidth:       '80px',
                    transition:     'all 150ms',
                  }}
                >
                  {isActing
                    ? <Loader2 size={11} style={{ animation: 'admin-spin 0.8s linear infinite' }} />
                    : <AlertTriangle size={11} />
                  }
                  {isActing ? 'Working…' : 'Reject'}
                </button>
              </>
            )}

            {activeTab === 'confirmed' && (
              <button
                onClick={() => setDispatchId(r.id)}
                disabled={isActing}
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            '5px',
                  padding:        '7px 14px',
                  fontFamily:     'var(--font-body)',
                  fontSize:       '10px',
                  fontWeight:     700,
                  letterSpacing:  '0.1em',
                  textTransform:  'uppercase',
                  color:          isActing ? 'var(--text-muted)' : '#0A0A0A',
                  background:     isActing ? 'transparent' : 'var(--accent)',
                  border:         `1px solid ${isActing ? 'var(--border)' : 'var(--accent)'}`,
                  cursor:         isActing ? 'not-allowed' : 'pointer',
                  opacity:        isActing ? 0.5 : 1,
                  whiteSpace:     'nowrap',
                  minWidth:       '130px',
                  transition:     'all 150ms',
                }}
              >
                {isActing
                  ? <Loader2 size={11} style={{ animation: 'admin-spin 0.8s linear infinite' }} />
                  : <Truck size={11} />
                }
                {isActing ? 'Dispatching…' : 'Mark Dispatched'}
              </button>
            )}

            {activeTab === 'pending_payment' && (
              <span style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         '#C9A84C',
              }}>
                Awaiting Upload
              </span>
            )}

            {activeTab === 'dispatched' && (
              <span style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '5px',
                fontFamily:     'var(--font-mono)',
                fontSize:       '10px',
                letterSpacing:  '0.12em',
                textTransform:  'uppercase',
                color:          '#C084FC',
              }}>
                <PackageCheck size={12} /> In Transit
              </span>
            )}
          </div>
        )
      },
    },
  ]

  const activeTabMeta = TABS.find(t => t.id === activeTab)

  return (
    <div style={{ padding: '28px 20px 80px', maxWidth: '1400px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          margin:        '0 0 4px',
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(24px, 4vw, 36px)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color:         'var(--text-primary)',
          lineHeight:    1,
        }}>
          ORDER PIPELINE
        </h1>
        <p style={{
          margin:        0,
          fontFamily:    'var(--font-mono)',
          fontSize:      '10px',
          letterSpacing: '0.2em',
          color:         'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          Fulfillment Dashboard
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display:        'flex',
        gap:            '2px',
        marginBottom:   '20px',
        overflowX:      'auto',
        borderBottom:   '1px solid var(--border)',
        paddingBottom:  0,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabState)}
              style={{
                padding:       '12px 20px',
                fontFamily:    'var(--font-body)',
                fontSize:      '11px',
                fontWeight:    isActive ? 700 : 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         isActive ? tab.color : 'var(--text-muted)',
                background:    isActive ? `${tab.color}10` : 'none',
                border:        'none',
                borderBottom:  isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                transition:    'all 150ms ease',
                marginBottom:  '-1px',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Order count */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        marginBottom: '16px',
      }}>
        <span style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '11px',
          letterSpacing: '0.12em',
          color:         'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        </span>
        {activeTabMeta && !loading && orders.length > 0 && (
          <span style={{
            display:       'inline-block',
            padding:       '2px 8px',
            background:    `${activeTabMeta.color}15`,
            border:        `1px solid ${activeTabMeta.color}40`,
            color:         activeTabMeta.color,
            fontFamily:    'var(--font-mono)',
            fontSize:      '9px',
            fontWeight:    700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {activeTabMeta.label}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{
        background:  'var(--bg-surface)',
        border:      '1px solid var(--border)',
        overflow:    'hidden',
      }}>
        <AdminTable
          columns={columns}
          rows={orders}
          loading={loading}
          emptyMessage="No orders in this stage."
        />
      </div>

      {/* Modals */}
      {proofId && (
        <ProofModal orderId={proofId} onClose={() => setProofId(null)} />
      )}
      {confirmPaymentId && (
        <ConfirmDialog
          title="Verify Payment"
          message="This confirms the bank transfer is received. The student will be notified and the order moves to Confirmed."
          confirmLabel="Verify & Confirm"
          onConfirm={() => handleConfirmPayment(confirmPaymentId)}
          onCancel={() => setConfirmPaymentId(null)}
        />
      )}
      {markIncompleteId && (
        <ConfirmDialog
          title="Reject Payment Proof"
          message="This marks the payment as incomplete. The student will be notified to contact support."
          confirmLabel="Reject Proof"
          variant="danger"
          onConfirm={() => handleMarkIncomplete(markIncompleteId)}
          onCancel={() => setMarkIncompleteId(null)}
        />
      )}
      {dispatchId && (
        <ConfirmDialog
          title="Dispatch Order"
          message="This marks the order as shipped. The student will be notified it is on the way."
          confirmLabel="Mark as Dispatched"
          onConfirm={() => handleDispatch(dispatchId)}
          onCancel={() => setDispatchId(null)}
        />
      )}

      <style>{`
        @keyframes admin-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
