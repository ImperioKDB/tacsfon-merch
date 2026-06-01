'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag }         from 'lucide-react'
import OrderCard               from './OrderCard'
import type { Order, OrderStatus } from '@/types'

type Tab = 'all' | OrderStatus

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',             label: 'All'        },
  { key: 'pending_payment', label: 'Pending'    },
  { key: 'confirmed',       label: 'Confirmed'  },
  { key: 'dispatched',      label: 'Dispatched' },
  { key: 'received',        label: 'Received'   },
]

type LoadState = 'loading' | 'ready' | 'error'

function EmptyState({ tab }: { tab: Tab }) {
  const label = tab === 'all' ? 'orders' : 'matching orders'
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }}>
        <ShoppingBag size={28} style={{ color: 'var(--color-text-disabled)' }} />
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>No {label} yet</p>
      </div>
    </div>
  )
}

export default function OrdersClient() {
  const [orders,    setOrders]    = useState<Order[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [activeTab, setActiveTab] = useState<Tab>('all')

  useEffect(() => {
    async function load() {
      setLoadState('loading')
      try {
        const res  = await fetch('/api/orders', { cache: 'no-store' })
        const body = await res.json()
        if (body?.success) {
          setOrders(body.data ?? [])
          setLoadState('ready')
        } else { setLoadState('error') }
      } catch { setLoadState('error') }
    }
    load()
  }, [])

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab)

  return (
    <main className="min-h-screen px-4 py-10 md:px-8 lg:px-16" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-urbanist)' }}>My Orders</h1>
        
        <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto" style={{ background: 'var(--color-surface)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--color-gold)' : 'transparent',
                color: activeTab === tab.key ? '#000' : 'var(--color-text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadState === 'loading' && <div className="h-20 animate-pulse bg-zinc-900 rounded-xl" />}
        {loadState === 'ready' && (
          filtered.length === 0 ? <EmptyState tab={activeTab} /> : (
            <div className="space-y-3">
              {filtered.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          )
        )}
      </div>
    </main>
  )
}
