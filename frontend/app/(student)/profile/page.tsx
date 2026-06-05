'use client'

import { useEffect, useState, useCallback } from 'react'
import Link                                 from 'next/link'
import { useAuth }                          from '@/hooks/useAuth'
import { createBrowserClient }             from '@/lib/supabase/browser'
import { apiFetch }                         from '@/lib/api/fetch'
import { useNotificationStore }             from '@/store/notifications'
import {
  Bell, ShoppingBag, Package2,
  LogOut, ShieldCheck, ChevronRight,
  RefreshCw, Zap, Pencil, Check, Loader2,
} from 'lucide-react'
import type { Order, Profile, Notification } from '@/types'

/* ── Status colours matching the design system ── */
const STATUS_COLORS: Record<string, string> = {
  pending_payment:   'var(--warning)',
  payment_submitted: 'var(--info)',
  confirmed:         '#2DD4BF',
  dispatched:        '#C084FC',
  received:          'var(--success)',
  cancelled:         'var(--danger)',
}

/* ── Order status stepper ── */
const STEPS       = ['pending_payment', 'payment_submitted', 'confirmed', 'dispatched'] as const
const STEP_LABELS = ['Placed', 'Verified', 'Confirmed', 'Dispatched']

function OrderStepper({ status }: { status: string }) {
  const idx = STEPS.indexOf(status as typeof STEPS[number])
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginTop: '16px', gap: 0 }}>
      {STEP_LABELS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width:      '8px',
              height:     '8px',
              borderRadius: '50%',
              background:  i <= idx ? 'var(--accent)' : 'var(--bg-elevated)',
              boxShadow:   i === idx ? '0 0 8px 2px var(--accent-dim)' : 'none',
              transform:   i === idx ? 'scale(1.4)' : 'scale(1)',
              transition:  'all 500ms ease',
              border:      i <= idx ? 'none' : '1px solid var(--border)',
            }} />
            <p style={{
              fontSize:      '8px',
              fontFamily:    'var(--font-mono)',
              fontWeight:    700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace:    'nowrap',
              color:         i <= idx ? 'var(--accent)' : 'var(--text-muted)',
              margin:        0,
            }}>
              {label}
            </p>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div style={{
              flex:       1,
              height:     '1px',
              marginBottom: '18px',
              marginLeft:   '4px',
              marginRight:  '4px',
              background:  i < idx ? 'var(--accent)' : 'var(--border)',
              transition:  'background 500ms ease',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Tile wrapper ── */
function Tile({
  children, href, onClick, style = {},
}: {
  children:  React.ReactNode
  href?:     string
  onClick?:  () => void
  style?:    React.CSSProperties
}) {
  const base: React.CSSProperties = {
    background:   'var(--bg-surface)',
    border:       '1px solid var(--border)',
    padding:      '18px',
    display:      'flex',
    flexDirection:'column',
    cursor:       href || onClick ? 'pointer' : 'default',
    transition:   'border-color 200ms ease, transform 150ms ease',
    position:     'relative',
    overflow:     'hidden',
    ...style,
  }

  const hoverIn  = (e: React.MouseEvent<HTMLElement>) => {
    if (href || onClick) {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
      ;(e.currentTarget as HTMLElement).style.transform  = 'translateY(-1px)'
    }
  }
  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    if (href || onClick) {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      ;(e.currentTarget as HTMLElement).style.transform  = 'translateY(0)'
    }
  }

  if (href) {
    return (
      <Link href={href} style={{ ...base, textDecoration: 'none' }}
        onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        {children}
      </Link>
    )
  }
  return (
    <div style={base} onClick={onClick} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {children}
    </div>
  )
}

/* ── Section label ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize:      '9px',
      fontFamily:    'var(--font-mono)',
      fontWeight:    700,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color:         'var(--text-muted)',
      marginBottom:  '12px',
    }}>
      {children}
    </p>
  )
}

/* ── Main component ── */
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createBrowserClient()

  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [activeOrder,  setActiveOrder]  = useState<Order | null>(null)
  const [notifications,setNotifications]= useState<Notification[]>([])
  const [isEditing,    setIsEditing]    = useState(false)
  const [isSaving,     setIsSaving]     = useState(false)
  const [form,         setForm]         = useState({ phone: '', delivery_address: '' })
  const [saveMsg,      setSaveMsg]      = useState<string | null>(null)
  const [refreshing,   setRefreshing]   = useState(false)

  const unreadCount = useNotificationStore(s => s.unreadCount)

  const load = useCallback(async () => {
    try {
      const [profRes, ordersRes, notifRes] = await Promise.all([
        apiFetch<{ data: Profile }>('/auth/profile'),
        apiFetch<{ data: Order[]  }>('/orders'),
        apiFetch<{ data: Notification[] }>('/notifications'),
      ])
      const p = profRes.data
      setProfile(p)
      setForm({ phone: p?.phone || '', delivery_address: (p as any)?.delivery_address || '' })

      const active = (ordersRes.data ?? []).find(
        o => !['received', 'cancelled'].includes(o.status)
      ) ?? null
      setActiveOrder(active)
      setNotifications((notifRes.data ?? []).slice(0, 3))
    } catch (err) {
      console.error('[Profile] load error:', err)
    }
  }, [])

  useEffect(() => { if (!authLoading && user) load() }, [authLoading, user, load])

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMsg(null)
    try {
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body:   JSON.stringify(form),
      })
      setSaveMsg('Saved')
      setIsEditing(false)
      load()
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (authLoading) {
    return (
      <div style={{
        minHeight:      'calc(100dvh - 64px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'var(--bg-base)',
      }}>
        <Loader2 size={20} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        minHeight:      'calc(100dvh - 64px)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '20px',
        background:     'var(--bg-base)',
        padding:        '24px',
        textAlign:      'center',
      }}>
        <p style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '28px',
          letterSpacing: '0.08em',
          color:         'var(--text-primary)',
        }}>
          SIGN IN TO CONTINUE
        </p>
        <Link href="/login" style={{
          display:       'inline-block',
          padding:       '14px 40px',
          background:    'var(--accent)',
          color:         '#0A0A0A',
          fontFamily:    'var(--font-body)',
          fontSize:      '12px',
          fontWeight:    700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textDecoration:'none',
        }}>
          Sign In
        </Link>
      </div>
    )
  }

  const displayName = profile?.full_name
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'Member'

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }).toUpperCase()
    : '—'

  const shortId = user.id.slice(0, 8).toUpperCase()
  const isAdmin = profile?.role === 'admin'
    || user.app_metadata?.role === 'admin'
    || user.user_metadata?.role === 'admin'

  /* ── Input style ── */
  const inputStyle: React.CSSProperties = {
    width:        '100%',
    boxSizing:    'border-box',
    padding:      '12px 14px',
    background:   'var(--bg-elevated)',
    border:       '1px solid var(--border)',
    color:        'var(--text-primary)',
    fontFamily:   'var(--font-body)',
    fontSize:     '13px',
    outline:      'none',
    borderRadius: 0,
    transition:   'border-color 200ms ease',
  }

  return (
    <div style={{
      minHeight:  'calc(100dvh - 64px)',
      background: 'var(--bg-base)',
      padding:    '24px 16px 120px',
      maxWidth:   '680px',
      margin:     '0 auto',
    }}>

      {/* ── Header ── */}
      <div style={{
        marginBottom: '32px',
        paddingBottom:'24px',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Name */}
        <h1 style={{
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(36px, 8vw, 56px)',
          letterSpacing: '0.04em',
          lineHeight:    1,
          color:         'var(--text-primary)',
          margin:        '0 0 8px',
          textTransform: 'uppercase',
        }}>
          {displayName.toUpperCase()}
          <span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        {/* Meta row */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '8px',
          flexWrap:   'wrap',
        }}>
          {[
            isAdmin ? 'ADMIN' : 'MEMBER',
            shortId,
            `SINCE ${memberSince}`,
          ].map((item, i) => (
            <span key={i} style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '10px',
              letterSpacing: '0.16em',
              color:         'var(--text-muted)',
            }}>
              {i > 0 && <span style={{ marginRight: '8px', opacity: 0.3 }}>·</span>}
              {item}
            </span>
          ))}
        </div>

        {/* Role badge */}
        <div style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        '6px',
          marginTop:  '12px',
          padding:    '4px 12px',
          background: 'var(--accent-dim)',
          border:     '1px solid var(--accent)',
        }}>
          <ShieldCheck size={11} style={{ color: 'var(--accent)' }} />
          <span style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            letterSpacing: '0.15em',
            color:         'var(--accent)',
            textTransform: 'uppercase',
          }}>
            {isAdmin ? 'Admin Access' : 'Standard Access'}
          </span>
        </div>
      </div>

      {/* ── Refresh button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '6px',
            background:    'none',
            border:        '1px solid var(--border)',
            color:         'var(--text-muted)',
            fontFamily:    'var(--font-body)',
            fontSize:      '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding:       '8px 14px',
            cursor:        refreshing ? 'not-allowed' : 'pointer',
            transition:    'color 150ms, border-color 150ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <RefreshCw size={12} style={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
          }} />
          Refresh
        </button>
      </div>

      {/* ── Bento grid ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 '8px',
      }}>

        {/* A — Notifications (full width) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile href="/notifications">
            <Label>Order Updates</Label>
            {notifications.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width:          '40px',
                  height:         '40px',
                  flexShrink:     0,
                  background:     'var(--accent-dim)',
                  border:         '1px solid var(--accent)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  position:       'relative',
                }}>
                  <Bell size={16} style={{ color: 'var(--accent)' }} />
                  {unreadCount > 0 && (
                    <span style={{
                      position:        'absolute',
                      top:             '-4px',
                      right:           '-4px',
                      minWidth:        '16px',
                      height:          '16px',
                      background:      'var(--danger)',
                      color:           '#fff',
                      fontSize:        '9px',
                      fontFamily:      'var(--font-body)',
                      fontWeight:      700,
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                      borderRadius:    '99px',
                      padding:         '0 3px',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily:   'var(--font-body)',
                    fontSize:     '13px',
                    color:        'var(--text-primary)',
                    lineHeight:   1.4,
                    margin:       '0 0 6px',
                    overflow:     'hidden',
                    display:      '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {notifications[0].message}
                  </p>
                  <p style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '10px',
                    color:         'var(--accent)',
                    letterSpacing: '0.1em',
                    margin:        0,
                  }}>
                    Tap to view all →
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={16} style={{ color: 'var(--text-muted)' }} />
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize:   '13px',
                  color:      'var(--text-muted)',
                  margin:     0,
                }}>
                  No new notifications
                </p>
              </div>
            )}
          </Tile>
        </div>

        {/* B — Active order (full width) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile href={activeOrder ? `/orders/${activeOrder.id}` : '/orders'}>
            <Label>Active Order</Label>
            {activeOrder ? (
              <>
                <div style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  gap:            '12px',
                }}>
                  <p style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '16px',
                    fontWeight:    700,
                    color:         'var(--text-primary)',
                    letterSpacing: '0.06em',
                    margin:        0,
                  }}>
                    #{activeOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span style={{
                    display:       'inline-block',
                    padding:       '4px 10px',
                    background:    `color-mix(in srgb, ${STATUS_COLORS[activeOrder.status] ?? 'var(--text-muted)'} 15%, transparent)`,
                    border:        `1px solid color-mix(in srgb, ${STATUS_COLORS[activeOrder.status] ?? 'var(--text-muted)'} 35%, transparent)`,
                    color:         STATUS_COLORS[activeOrder.status] ?? 'var(--text-muted)',
                    fontFamily:    'var(--font-body)',
                    fontSize:      '10px',
                    fontWeight:    700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    whiteSpace:    'nowrap',
                  }}>
                    {activeOrder.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <OrderStepper status={activeOrder.status} />
                <p style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '11px',
                  color:         'var(--text-muted)',
                  marginTop:     '14px',
                  letterSpacing: '0.1em',
                  margin:        '14px 0 0',
                }}>
                  ₦{Number(activeOrder.total).toLocaleString()} · Tap to view details →
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package2 size={20} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize:   '13px',
                    color:      'var(--text-muted)',
                    fontWeight: 600,
                    margin:     '0 0 2px',
                  }}>
                    No active orders
                  </p>
                  <p style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '10px',
                    color:         'var(--accent)',
                    letterSpacing: '0.12em',
                    margin:        0,
                  }}>
                    VIEW ORDER HISTORY →
                  </p>
                </div>
              </div>
            )}
          </Tile>
        </div>

        {/* C1 — My Orders */}
        <Tile href="/orders">
          <Label>Inventory</Label>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <Package2 size={22} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
            <div>
              <p style={{
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(16px, 4vw, 20px)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color:         'var(--text-primary)',
                lineHeight:    1,
                margin:        '0 0 8px',
              }}>
                My Orders
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '9px',
                  color:         'var(--text-muted)',
                  letterSpacing: '0.15em',
                }}>
                  FULL HISTORY
                </span>
                <ChevronRight size={10} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </Tile>

        {/* C2 — Cart */}
        <Tile href="/cart">
          <Label>Cart</Label>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <ShoppingBag size={22} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
            <div>
              <p style={{
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(16px, 4vw, 20px)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color:         'var(--text-primary)',
                lineHeight:    1,
                margin:        '0 0 8px',
              }}>
                View Bag
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '9px',
                  color:         'var(--text-muted)',
                  letterSpacing: '0.15em',
                }}>
                  OPEN CART
                </span>
                <ChevronRight size={10} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </Tile>

        {/* D — Account Info (editable, full width) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile>
            {/* Header row */}
            <div style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   '20px',
            }}>
              <Label>Account Info</Label>

              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setForm({ phone: profile?.phone || '', delivery_address: (profile as any)?.delivery_address || '' })
                    }}
                    disabled={isSaving}
                    style={{
                      display:       'flex',
                      alignItems:    'center',
                      gap:           '5px',
                      background:    'none',
                      border:        '1px solid var(--border)',
                      cursor:        'pointer',
                      color:         'var(--text-muted)',
                      fontFamily:    'var(--font-body)',
                      fontSize:      '10px',
                      fontWeight:    600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding:       '6px 12px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      display:       'flex',
                      alignItems:    'center',
                      gap:           '5px',
                      background:    'var(--accent)',
                      border:        'none',
                      cursor:        isSaving ? 'not-allowed' : 'pointer',
                      color:         '#0A0A0A',
                      fontFamily:    'var(--font-body)',
                      fontSize:      '10px',
                      fontWeight:    700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding:       '6px 14px',
                      opacity:       isSaving ? 0.6 : 1,
                    }}
                  >
                    {isSaving
                      ? <Loader2 size={10} className="animate-spin" />
                      : <Check size={10} />
                    }
                    {isSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '5px',
                    background:    'none',
                    border:        '1px solid var(--border)',
                    cursor:        'pointer',
                    color:         'var(--accent)',
                    fontFamily:    'var(--font-body)',
                    fontSize:      '10px',
                    fontWeight:    600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding:       '6px 12px',
                    transition:    'border-color 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <Pencil size={10} /> Edit
                </button>
              )}
            </div>

            {saveMsg && (
              <p style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '12px',
                color:         saveMsg === 'Saved' ? 'var(--success)' : 'var(--danger)',
                marginBottom:  '16px',
              }}>
                {saveMsg}
              </p>
            )}

            {/* Email — always read-only */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:         'var(--text-muted)',
                marginBottom:  '6px',
              }}>
                Email
              </p>
              <p style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '13px',
                color:         'var(--text-primary)',
                wordBreak:     'break-all',
              }}>
                {user?.email ?? '—'}
              </p>
            </div>

            {isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '8px' }}>
                <div>
                  <label style={{
                    display:       'block',
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'var(--text-muted)',
                    marginBottom:  '8px',
                  }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 08012345678"
                    style={inputStyle}
                    onFocus={e  => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={{
                    display:       'block',
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'var(--text-muted)',
                    marginBottom:  '8px',
                  }}>
                    Delivery Address
                  </label>
                  <textarea
                    value={form.delivery_address}
                    onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                    placeholder="Your campus / delivery address"
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize:     'vertical',
                      lineHeight: 1.5,
                    }}
                    onFocus={e  => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'var(--text-muted)',
                    marginBottom:  '6px',
                  }}>
                    Phone
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize:   '13px',
                    color:      profile?.phone ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                    {profile?.phone || 'Not set'}
                  </p>
                </div>
                <div>
                  <p style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'var(--text-muted)',
                    marginBottom:  '6px',
                  }}>
                    Delivery
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize:   '13px',
                    color:      (profile as any)?.delivery_address ? 'var(--text-primary)' : 'var(--text-muted)',
                    lineHeight: 1.4,
                  }}>
                    {(profile as any)?.delivery_address || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </Tile>
        </div>

        {/* E — Admin link (if admin) */}
        {isAdmin && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Tile href="/admin">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width:          '40px',
                  height:         '40px',
                  flexShrink:     0,
                  background:     'var(--admin-accent-dim)',
                  border:         '1px solid var(--admin-accent)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}>
                  <Zap size={16} style={{ color: 'var(--admin-accent)' }} />
                </div>
                <div>
                  <p style={{
                    fontFamily:    'var(--font-display)',
                    fontSize:      '16px',
                    letterSpacing: '0.08em',
                    color:         'var(--text-primary)',
                    margin:        '0 0 3px',
                  }}>
                    ADMIN DASHBOARD
                  </p>
                  <p style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '10px',
                    letterSpacing: '0.12em',
                    color:         'var(--admin-accent)',
                    margin:        0,
                  }}>
                    MANAGE STORE →
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
              </div>
            </Tile>
          </div>
        )}

        {/* F — Sign out (full width) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile onClick={handleSignOut}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <LogOut size={16} style={{ color: 'var(--danger)' }} />
              <div>
                <p style={{
                  fontFamily:    'var(--font-body)',
                  fontSize:      '14px',
                  fontWeight:    600,
                  color:         'var(--danger)',
                  margin:        0,
                  letterSpacing: '0.04em',
                }}>
                  Sign Out
                </p>
                <p style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '10px',
                  letterSpacing: '0.12em',
                  color:         'var(--text-muted)',
                  margin:        '2px 0 0',
                }}>
                  {user.email}
                </p>
              </div>
            </div>
          </Tile>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
