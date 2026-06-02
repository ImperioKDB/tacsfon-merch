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
  RefreshCw, Zap,
} from 'lucide-react'
import type { Order, Profile, Notification } from '@/types'

// ─── Status stepper ───────────────────────────────────────────
const STEPS       = ['pending_payment', 'payment_submitted', 'confirmed', 'dispatched'] as const
const STEP_LABELS = ['Placed', 'Verified', 'Confirmed', 'Dispatched']
const TERMINAL    = ['received', 'cancelled']

function OrderStepper({ status }: { status: string }) {
  const idx = STEPS.indexOf(status as typeof STEPS[number])
  return (
    <div className="flex items-end w-full mt-4 gap-0">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full transition-all duration-500"
              style={{
                background: i <= idx ? '#C9A84C' : '#2A2A38',
                boxShadow : i === idx ? '0 0 8px 2px rgba(201,168,76,0.5)' : 'none',
                transform : i === idx ? 'scale(1.4)' : 'scale(1)',
              }}
            />
            <p
              className="text-[8px] font-black uppercase tracking-wider whitespace-nowrap"
              style={{ color: i <= idx ? '#C9A84C' : '#3A3A48' }}
            >
              {label}
            </p>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className="flex-1 h-px mx-1 mb-4 transition-all duration-500"
              style={{ background: i < idx ? '#C9A84C' : '#2A2A38' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Tile wrapper ─────────────────────────────────────────────
function Tile({
  children, href, onClick, className = '', style = {},
}: {
  children : React.ReactNode
  href?    : string
  onClick? : () => void
  className?: string
  style?   : React.CSSProperties
}) {
  const base: React.CSSProperties = {
    background   : '#0D0D14',
    border       : '1px solid #1E1E2A',
    padding      : '28px',
    display      : 'flex',
    flexDirection: 'column',
    transition   : 'transform 120ms ease, border-color 200ms ease, box-shadow 200ms ease',
    cursor       : href || onClick ? 'pointer' : 'default',
    textDecoration: 'none',
    ...style,
  }

  const handlePress = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.style.transform = 'scale(0.97)'
    setTimeout(() => { el.style.transform = 'scale(1)' }, 120)
    onClick?.()
  }

  const inner = (
    <div
      className={className}
      style={base}
      onClick={handlePress}
      onMouseEnter={e => {
        if (!href && !onClick) return
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#C9A84C40'
        el.style.boxShadow   = '0 0 24px rgba(201,168,76,0.06)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#1E1E2A'
        el.style.boxShadow   = 'none'
      }}
    >
      {children}
    </div>
  )

  return href
    ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
    : inner
}

// ─── Eyebrow label ────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize     : '9px',
      fontWeight   : 900,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color        : '#3E3E52',
      marginBottom : '10px',
      fontFamily   : 'var(--font-inter, monospace)',
    }}>
      {children}
    </p>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth()
  const supabase = createBrowserClient()

  const [profile,     setProfile]     = useState<Profile | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [latestNotif, setLatestNotif] = useState<Notification | null>(null)

  const unread = useNotificationStore(s => s.unreadCount)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [{ data: prof }, ordersData, notifsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),

        // FIX (a): GET /orders returns Order[] directly via apiFetch (body.data is the array).
        //          Do NOT do ordersData?.orders — that is always undefined.
        apiFetch<Order[]>('/orders').catch(() => null),

        // GET /notifications returns { notifications: Notification[], unread: number }
        apiFetch<{ notifications: Notification[]; unread: number }>('/notifications').catch(() => null),
      ])

      if (prof) setProfile(prof as Profile)

      // FIX (a) continued: guard with Array.isArray
      const orders: Order[] = Array.isArray(ordersData) ? ordersData : []
      const active = orders.find(o => !TERMINAL.includes(o.status))
      setActiveOrder(active ?? null)

      const notifs = notifsData?.notifications
      if (notifs?.length) setLatestNotif(notifs[0])

    } finally {
      // FIX (b): always clear loading, even if fetches fail
      setPageLoading(false)
    }
  }, [user, supabase])

  useEffect(() => { if (user) load() }, [user, load])

  if (authLoading || pageLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="animate-spin" style={{ color: '#C9A84C' }} size={28} />
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0]?.toUpperCase() || 'MEMBER'
  const memberId  = user?.id?.slice(0, 8).toUpperCase() ?? '--------'
  const sinceYear = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()
    : '---'

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#F7F5F0', paddingBottom: '80px' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 40px' }}>
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <div style={{
            position    : 'absolute',
            top         : '50%', left: '-10%',
            width       : '60%', height: '120%',
            background  : 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
            transform   : 'translateY(-50%)',
            pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize     : 'clamp(56px, 15vw, 96px)',
            fontWeight   : 900,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            fontStyle    : 'italic',
            lineHeight   : 1,
            fontFamily   : 'var(--font-urbanist, sans-serif)',
            color        : '#F7F5F0',
            position     : 'relative',
          }}>
            {firstName}<span style={{ color: '#C9A84C' }}>.</span>
          </h1>
        </div>

        <p style={{
          fontFamily   : 'monospace',
          fontSize     : '10px',
          letterSpacing: '0.25em',
          color        : '#3E3E52',
          textTransform: 'uppercase',
          marginBottom : '8px',
        }}>
          MEMBER · {memberId} · SINCE {sinceYear}
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={12} style={{ color: isAdmin ? '#C9A84C' : '#3E3E52' }} />
          <span style={{
            fontSize     : '9px',
            fontWeight   : 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color        : isAdmin ? '#C9A84C' : '#3E3E52',
            fontFamily   : 'monospace',
          }}>
            {isAdmin ? 'Administrator' : 'Standard Access'}
          </span>
        </div>
      </div>

      {/* ── Bento Grid ─────────────────────────────────────── */}
      <div style={{
        maxWidth           : '720px',
        margin             : '0 auto',
        padding            : '0 24px',
        display            : 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap                : '12px',
      }}>

        {/* A — Notification Portal */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile href="/notifications">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Label>Order Updates</Label>
              {unread > 0 && (
                <div style={{
                  background   : '#C9A84C',
                  color        : '#050508',
                  fontSize     : '9px',
                  fontWeight   : 900,
                  padding      : '3px 8px',
                  fontFamily   : 'monospace',
                  letterSpacing: '0.1em',
                  borderRadius : '2px',
                  display      : 'flex',
                  alignItems   : 'center',
                  gap          : '5px',
                }}>
                  <Zap size={9} />
                  {unread} UNREAD
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <div style={{
                width          : '40px', height: '40px',
                borderRadius   : '50%',
                background     : unread > 0 ? 'rgba(201,168,76,0.1)' : '#13131A',
                border         : `1px solid ${unread > 0 ? 'rgba(201,168,76,0.3)' : '#1E1E2A'}`,
                display        : 'flex',
                alignItems     : 'center',
                justifyContent : 'center',
                flexShrink     : 0,
                position       : 'relative',
              }}>
                <Bell size={16} style={{ color: unread > 0 ? '#C9A84C' : '#3E3E52' }} />
                {unread > 0 && (
                  <span style={{
                    position  : 'absolute', top: '-4px', right: '-4px',
                    width     : '8px', height: '8px',
                    background: '#C9A84C', borderRadius: '50%',
                    boxShadow : '0 0 6px #C9A84C',
                    animation : 'pulse 2s infinite',
                  }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {latestNotif ? (
                  <>
                    <p style={{
                      fontSize        : '13px',
                      fontWeight      : latestNotif.is_read ? 400 : 700,
                      color           : latestNotif.is_read ? '#6B7280' : '#F7F5F0',
                      lineHeight      : 1.4,
                      overflow        : 'hidden',
                      display         : '-webkit-box',
                      WebkitLineClamp : 2,
                      WebkitBoxOrient : 'vertical',
                    }}>
                      {latestNotif.message}
                    </p>
                    <p style={{ fontSize: '10px', color: '#3E3E52', marginTop: '4px', fontFamily: 'monospace' }}>
                      Tap to view all →
                    </p>
                  </>
                ) : (
                  <p style={{
                    fontSize     : '10px',
                    fontWeight   : 900,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color        : '#3E3E52',
                    fontFamily   : 'monospace',
                  }}>
                    SYSTEM STATUS: CLEAR — No pending alerts
                  </p>
                )}
              </div>
              <ChevronRight size={14} style={{ color: '#3E3E52', flexShrink: 0 }} />
            </div>
          </Tile>
        </div>

        {/* B — Active Order Snapshot */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile href={activeOrder ? `/orders/${activeOrder.id}` : '/orders'}>
            <Label>Active Order</Label>
            {activeOrder ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 900, color: '#F7F5F0', letterSpacing: '0.05em' }}>
                    #{activeOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{
                    fontSize     : '9px',
                    fontWeight   : 900,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color        : '#C9A84C',
                    fontFamily   : 'monospace',
                    background   : 'rgba(201,168,76,0.08)',
                    border       : '1px solid rgba(201,168,76,0.2)',
                    padding      : '4px 10px',
                  }}>
                    {activeOrder.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <OrderStepper status={activeOrder.status} />
                <p style={{
                  fontSize     : '10px',
                  color        : '#3E3E52',
                  marginTop    : '14px',
                  letterSpacing: '0.1em',
                  fontFamily   : 'monospace',
                }}>
                  ₦{Number(activeOrder.total).toLocaleString()} · Tap to view details →
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package2 size={20} style={{ color: '#3E3E52' }} />
                <div>
                  <p style={{ fontSize: '13px', color: '#3E3E52', fontWeight: 600 }}>No active orders</p>
                  <p style={{ fontSize: '10px', color: '#2A2A38', marginTop: '2px', fontFamily: 'monospace' }}>
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
            <Package2 size={22} style={{ color: '#C9A84C', marginBottom: '16px' }} />
            <div>
              <p style={{
                fontSize     : 'clamp(18px, 4vw, 22px)',
                fontWeight   : 900,
                fontStyle    : 'italic',
                textTransform: 'uppercase',
                color        : '#F7F5F0',
                letterSpacing: '-0.02em',
                fontFamily   : 'var(--font-urbanist, sans-serif)',
                lineHeight   : 1,
              }}>
                My Orders
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '9px', color: '#3E3E52', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                  FULL HISTORY
                </span>
                <ChevronRight size={10} style={{ color: '#3E3E52' }} />
              </div>
            </div>
          </div>
        </Tile>

        {/* C2 — Cart */}
        <Tile href="/cart">
          <Label>Cart</Label>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <ShoppingBag size={22} style={{ color: '#C9A84C', marginBottom: '16px' }} />
            <div>
              <p style={{
                fontSize     : 'clamp(18px, 4vw, 22px)',
                fontWeight   : 900,
                fontStyle    : 'italic',
                textTransform: 'uppercase',
                color        : '#F7F5F0',
                letterSpacing: '-0.02em',
                fontFamily   : 'var(--font-urbanist, sans-serif)',
                lineHeight   : 1,
              }}>
                View Bag
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '9px', color: '#3E3E52', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                  OPEN CART
                </span>
                <ChevronRight size={10} style={{ color: '#3E3E52' }} />
              </div>
            </div>
          </div>
        </Tile>

        {/* D — Account Info */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Tile>
            <Label>Account Info</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '9px', color: '#3E3E52', fontFamily: 'monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
                  EMAIL
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {user?.email ?? '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '9px', color: '#3E3E52', fontFamily: 'monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
                  CONTACT
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                  {profile?.phone ?? 'Not set — update in settings'}
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '9px', color: '#3E3E52', fontFamily: 'monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
                  DEFAULT DELIVERY ADDRESS
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                  {profile?.delivery_address ?? 'Not set — update in settings'}
                </p>
              </div>
            </div>

            <div style={{ height: '1px', background: '#1A1A24', margin: '0 0 20px' }} />

            <button
              onClick={signOut}
              style={{
                display      : 'flex',
                alignItems   : 'center',
                gap          : '8px',
                background   : 'none',
                border       : 'none',
                cursor       : 'pointer',
                color        : '#4B1C1C',
                fontSize     : '9px',
                fontWeight   : 900,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily   : 'monospace',
                padding      : 0,
                transition   : 'color 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4B1C1C')}
            >
              <LogOut size={12} />
              Terminate Session
            </button>
          </Tile>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1);    }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
