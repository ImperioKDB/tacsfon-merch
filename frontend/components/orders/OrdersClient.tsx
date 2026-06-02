'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag }         from 'lucide-react'
import OrderCard               from './OrderCard'
import { apiFetch }            from '@/lib/api/fetch'
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
      <div className="w-16 h-16 flex items-center justify-center bg-zinc-900">
        <ShoppingBag size={28} className="text-zinc-600" />
      </div>
      <p className="font-semibold text-white">No {label} yet</p>
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
        // apiFetch prepends NEXT_PUBLIC_API_URL and attaches auth token
        const data = await apiFetch<Order[]>('/orders')
        setOrders(data ?? [])
        setLoadState('ready')
      } catch {
        setLoadState('error')
      }
    }
    load()
  }, [])

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab)

  return (
    <main className="min-h-screen px-4 py-10 md:px-8 lg:px-16 bg-[#0A0A0F]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">My Orders</h1>

        <div className="flex gap-1 p-1 bg-zinc-900 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--color-gold)' : 'transparent',
                color: activeTab === tab.key ? '#000' : '#9CA3AF',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadState === 'loading' && (
          <div className="h-20 animate-pulse bg-zinc-900" />
        )}
        {loadState === 'error' && (
          <p className="text-center text-zinc-500 py-10">
            Could not load orders. Please refresh.
          </p>
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
