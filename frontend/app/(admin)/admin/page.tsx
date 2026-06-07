'use client'

/**
 * Admin Dashboard — Order Pipeline
 * Card-based layout — no horizontal overflow on mobile.
 * Each card shows: order ID, customer, email, phone,
 * address, items count, total, date, and action buttons.
 */

import { useEffect, useState, useCallback } from 'react'
import { toast }                             from 'sonner'
import { Eye, CheckCircle, Truck, PackageCheck, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { apiFetch, ApiError }               from '@/lib/api/fetch'
import { formatPrice, formatDate, formatOrderId } from '@/lib/utils/formatters'
import ConfirmDialog                        from '@/components/admin/ConfirmDialog'
import ProofModal                           from '@/components/admin/ProofModal'

const A = '#5B8CFF'

type TabState = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'dispatched'

interface OrderRow {
  id:             string
  customer_name:  string | null
  total:          number
  created_at:     string
  status:         string
  payment_status: string
  proof_url:      string | null
  delivery_address?: string | null
  phone?:         string | null
  user:           { full_name: string; email: string; phone?: string | null } | null
  order_items:    { id: string; quantity: number; product_variant: { product: { name: string } | null } | null }[]
}

const TABS = [
  { id: 'payment_submitted', label: 'To Verify',      color: '#60A5FA' },
  { id: 'confirmed',         label: 'To Dispatch',    color: '#2DD4BF' },
  { id: 'dispatched',        label: 'In Transit',     color: '#C084FC' },
  { id: 'pending_payment',   label: 'Awaiting Proof', color: '#C9A84C' },
]

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div style={{
      background:  'var(--bg-surface)',
      border:      '1px solid var(--border)',
      padding:     '16px',
      animation:   'admin-pulse 1.4s ease-in-out infinite',
    }}>
      {[80, 60, 45, 70].map((w, i) => (
        <div key={i} style={{
          height:       '12px',
          width:        `${w}%`,
          background:   'var(--bg-elevated)',
          marginBottom: '10px',
          borderRadius: '2px',
        }} />
      ))}
    </div>
  )
}

/* ── Order card ── */
function OrderCard({
  order, activeTab, acting, onViewProof, onConfirm, onReject, onDispatch,
}: {
  order:       OrderRow
  activeTab:   TabState
  acting:      string | null
  onViewProof: (id: string) => void
  onConfirm:   (id: string) => void
  onReject:    (id: string) => void
  onDispatch:  (id: string) => void
}) {
  const isActing    = acting === order.id
  const customerName = order.user?.full_name ?? order.customer_name ?? '—'
  const email        = order.user?.email ?? '—'
  const phone        = order.phone ?? order.user?.phone ?? '—'
  const address      = order.delivery_address ?? '—'
  const itemCount    = order.order_items?.length ?? 0

  const tabMeta = TABS.find(t => t.id === activeTab)

  return (
    <div style={{
      background:   'var(--bg-surface)',
      border:       '1px solid var(--border)',
      overflow:     'hidden',
      position:     'relative',
    }}>
      {/* Coloured top bar */}
      <div style={{
        height:     '3px',
        background: tabMeta?.color ?? A,
      }} />

      <div style={{ padding: '16px' }}>
        {/* Header row */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          marginBottom:   '14px',
          gap:            '8px',
        }}>
          <span style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '12px',
            fontWeight:    700,
            color:         A,
            letterSpacing: '0.08em',
          }}>
            {formatOrderId(order.id)}
          </span>
          <span style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '14px',
            fontWeight:    700,
            color:         'var(--accent)',
            whiteSpace:    'nowrap',
          }}>
            {formatPrice(order.total)}
          </span>
        </div>

        {/* Buyer details grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '10px 16px',
          marginBottom:        '14px',
        }}>
          <Detail label="Customer" value={customerName} />
          <Detail label="Email"    value={email}        small />
          <Detail label="Phone"    value={phone}        />
          <Detail label="Items"    value={`${itemCount} item${itemCount !== 1 ? 's' : ''}`} />
          <Detail label="Date"     value={formatDate(order.created_at)} />
        </div>

        {/* Address — full width */}
        <div style={{
          padding:      '10px 12px',
          background:   'var(--bg-elevated)',
          border:       '1px solid var(--border)',
          marginBottom: '14px',
        }}>
          <p style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '9px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--text-muted)',
            margin:        '0 0 4px',
          }}>
            Delivery Address
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '12px',
            color:      address === '—' ? 'var(--text-muted)' : 'var(--text-primary)',
            margin:     0,
            lineHeight: 1.4,
          }}>
            {address}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {activeTab === 'payment_submitted' && (
            <>
              <ActionButton
                onClick={() => onViewProof(order.id)}
                disabled={false}
                loading={false}
                color="var(--text-muted)"
                bg="var(--bg-elevated)"
                border="var(--border)"
              >
                <Eye size={11} /> View Proof
              </ActionButton>
              <ActionButton
                onClick={() => onConfirm(order.id)}
                disabled={isActing}
                loading={isActing}
                color="#4CAF7D"
                bg="rgba(76,175,125,0.1)"
                border="rgba(76,175,125,0.35)"
                loadingText="Confirming…"
              >
                <CheckCircle size={11} /> Confirm
              </ActionButton>
              <ActionButton
                onClick={() => onReject(order.id)}
                disabled={isActing}
                loading={false}
                color="var(--danger)"
                bg="rgba(224,82,82,0.08)"
                border="rgba(224,82,82,0.3)"
              >
                <AlertTriangle size={11} /> Reject
              </ActionButton>
            </>
          )}

          {activeTab === 'confirmed' && (
            <ActionButton
              onClick={() => onDispatch(order.id)}
              disabled={isActing}
              loading={isActing}
              color="#0A0A0A"
              bg="var(--accent)"
              border="var(--accent)"
              loadingText="Dispatching…"
            >
              <Truck size={11} /> Mark Dispatched
            </ActionButton>
          )}

          {activeTab === 'pending_payment' && (
            <span style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         '#C9A84C',
              display:       'flex',
              alignItems:    'center',
              gap:           '5px',
            }}>
              Awaiting student upload
            </span>
          )}

          {activeTab === 'dispatched' && (
            <span style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         '#C084FC',
              display:       'flex',
              alignItems:    'center',
              gap:           '5px',
            }}>
              <PackageCheck size={12} /> In Transit
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      '9px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color:         'var(--text-muted)',
        margin:        '0 0 2px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily:  'var(--font-body)',
        fontSize:    small ? '11px' : '13px',
        fontWeight:  600,
        color:       'var(--text-primary)',
        margin:      0,
        overflow:    'hidden',
        whiteSpace:  'nowrap',
        textOverflow:'ellipsis',
      }}>
        {value}
      </p>
    </div>
  )
}

function ActionButton({
  onClick, disabled, loading, color, bg, border,
  children, loadingText = 'Working…',
}: {
  onClick:       () => void
  disabled:      boolean
  loading:       boolean
  color:         string
  bg:            string
  border:        string
  children:      React.ReactNode
  loadingText?:  string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '5px',
        padding:        '8px 14px',
        fontFamily:     'var(--font-body)',
        fontSize:       '10px',
        fontWeight:     700,
        letterSpacing:  '0.1em',
        textTransform:  'uppercase',
        color:          disabled ? 'var(--text-muted)' : color,
        background:     disabled ? 'transparent' : bg,
        border:         `1px solid ${disabled ? 'var(--border)' : border}`,
        cursor:         disabled ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.45 : 1,
        whiteSpace:     'nowrap',
        transition:     'opacity 150ms',
      }}
    >
      {loading
        ? <><Loader2 size={10} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> {loadingText}</>
        : children
      }
    </button>
  )
}

export default function OrderPipelinePage() {
  const [orders,    setOrders]    = useState<OrderRow[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<TabState>('payment_submitted')
  const [proofId,   setProofId]   = useState<string | null>(null)

  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null)
  const [markIncompleteId, setMarkIncompleteId] = useState<string | null>(null)
  const [dispatchId,       setDispatchId]       = useState<string | null>(null)
  const [acting,           setActing]           = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiFetch<{ orders: OrderRow[] }>(
        `/admin/orders?limit=100&status=${activeTab}`
      )
      setOrders(d.orders ?? [])
    } catch {
      toast.error('Failed to load orders.')
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
      toast.success('Payment verified — order confirmed.')
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
      toast.info('Marked incomplete. Student notified.')
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

  const activeTabMeta = TABS.find(t => t.id === activeTab)

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        marginBottom:   '24px',
        gap:            '12px',
      }}>
        <div>
          <h1 style={{
            margin:        '0 0 4px',
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(22px, 5vw, 32px)',
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
        <button
          onClick={load}
          disabled={loading}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
            background: 'none',
            border:     '1px solid var(--border)',
            color:      'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize:   '11px',
            padding:    '8px 14px',
            cursor:     loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <RefreshCw size={12} style={{
            animation: loading ? 'admin-spin 1s linear infinite' : 'none',
          }} />
          Refresh
        </button>
      </div>

      {/* Tab bar — scrollable so all 4 tabs fit */}
      <div style={{
        display:       'flex',
        overflowX:     'auto',
        borderBottom:  '1px solid var(--border)',
        marginBottom:  '20px',
        gap:           '2px',
        scrollbarWidth:'none',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabState)}
              style={{
                padding:       '11px 16px',
                fontFamily:    'var(--font-body)',
                fontSize:      '11px',
                fontWeight:    isActive ? 700 : 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         isActive ? tab.color : 'var(--text-muted)',
                background:    isActive ? `${tab.color}12` : 'none',
                border:        'none',
                borderBottom:  isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                marginBottom:  '-1px',
                flexShrink:    0,
                transition:    'all 150ms',
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

      {/* Count row */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        marginBottom: '16px',
      }}>
        {!loading && (
          <>
            <span style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '11px',
              letterSpacing: '0.12em',
              color:         'var(--text-muted)',
              textTransform: 'uppercase',
            }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
            {orders.length > 0 && activeTabMeta && (
              <span style={{
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
          </>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          padding:        '56px 20px',
          textAlign:      'center',
          background:     'var(--bg-surface)',
          border:         '1px solid var(--border)',
        }}>
          <p style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '20px',
            letterSpacing: '0.08em',
            color:         'var(--text-muted)',
            textTransform: 'uppercase',
            margin:        0,
          }}>
            No orders in this stage
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              acting={acting}
              onViewProof={setProofId}
              onConfirm={setConfirmPaymentId}
              onReject={setMarkIncompleteId}
              onDispatch={setDispatchId}
            />
          ))}
        </div>
      )}

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
        @keyframes admin-spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes admin-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
