'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag }         from 'lucide-react'
import OrderCard               from './OrderCard'
import type { Order, OrderStatus } from '@/types'

type Tab = 'all' | OrderStatus

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',        label: 'All'        },
  { key: 'pending',    label: 'Pending'    },
  { key: 'confirmed',  label: 'Confirmed'  },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'received',   label: 'Received'   },
]

type LoadState = 'loading' | 'ready' | 'error'

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const label = tab === 'all' ? 'orders' : `${tab} orders`
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <ShoppingBag size={28} style={{ color: 'var(--color-text-disabled)' }} />
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          No {label} yet
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {tab === 'all'
            ? 'Place your first order from the store.'
            : `You have no ${tab} orders right now.`}
        </p>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="h-28 rounded-2xl animate-pulse"
          style={{ background: 'var(--color-surface)' }}
        />
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OrdersClient() {
  const [orders,    setOrders]    = useState<Order[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [activeTab, setActiveTab] = useState<Tab>('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadState('loading')
      try {
        const res  = await fetch('/api/orders', { cache: 'no-store' })
        const body = await res.json()
        if (cancelled) return
        if (body?.success) {
          setOrders(body.data ?? [])
          setLoadState('ready')
        } else {
          setLoadState('error')
        }
      } catch {
        if (!cancelled) setLoadState('error')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab)

  return (
    <main
      className="min-h-screen px-4 py-10 md:px-8 lg:px-16"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <h1
          className="text-2xl md:text-3xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}
        >
          My Orders
        </h1>

        {/* Tab bar */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
          style={{ background: 'var(--color-surface)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.key
                  ? 'var(--color-gold)'
                  : 'transparent',
                color: activeTab === tab.key
                  ? '#000'
                  : 'var(--color-text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loadState === 'loading' && <OrdersSkeleton />}

        {loadState === 'error' && (
          <div className="text-center py-16 space-y-3">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Failed to load orders. Check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--color-gold)', color: '#000' }}
            >
              Retry
            </button>
          </div>
        )}

        {loadState === 'ready' && (
          filtered.length === 0
            ? <EmptyState tab={activeTab} />
            : (
              <div className="space-y-3">
                {filtered.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )
        )}

      </div>
    </main>
  )
}