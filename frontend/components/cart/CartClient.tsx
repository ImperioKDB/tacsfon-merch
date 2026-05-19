'use client'

import { useEffect, useState, useCallback } from 'react'
import CartItemRow     from './CartItemRow'
import CartSummary    from './CartSummary'
import EmptyCart      from './EmptyCart'
import ClearCartDialog from './ClearCartDialog'
import type { Cart } from '@/types'

type LoadState = 'loading' | 'ready' | 'error'

export default function CartClient() {
  const [cart,         setCart]         = useState<Cart | null>(null)
  const [loadState,    setLoadState]    = useState<LoadState>('loading')
  const [showClearDlg, setShowClearDlg] = useState(false)
  const [isClearing,   setIsClearing]   = useState(false)

  const fetchCart = useCallback(async () => {
    setLoadState('loading')
    try {
      const res  = await fetch('/api/cart', { cache: 'no-store' })
      const body = await res.json()
      if (body.success) { setCart(body.data); setLoadState('ready') }
      else setLoadState('error')
    } catch { setLoadState('error') }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleQuantityChange = useCallback(async (itemId: string, newQty: number) => {
    setCart(prev => prev
      ? { ...prev, items: prev.items.map(it => it.id === itemId ? { ...it, quantity: newQty } : it) }
      : prev
    )
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      })
      if (!res.ok) fetchCart()
    } catch { fetchCart() }
  }, [fetchCart])

  const handleRemove = useCallback(async (itemId: string) => {
    setCart(prev => prev
      ? { ...prev, items: prev.items.filter(it => it.id !== itemId) }
      : prev
    )
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' })
      if (!res.ok) fetchCart()
    } catch { fetchCart() }
  }, [fetchCart])

  const handleClear = useCallback(async () => {
    setIsClearing(true)
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' })
      if (res.ok) setCart(prev => (prev ? { ...prev, items: [] } : prev))
      else fetchCart()
    } catch { fetchCart() }
    setIsClearing(false)
    setShowClearDlg(false)
  }, [fetchCart])

  const total = (cart?.items ?? []).reduce((sum, it) => {
    const price = it.variant?.price_override ?? it.variant?.product?.base_price ?? 0
    return sum + price * it.quantity
  }, 0)

  const items   = cart?.items ?? []
  const isEmpty = items.length === 0

  if (loadState === 'loading') return <CartSkeleton />

  if (loadState === 'error') return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg)' }}>
      <div className="text-center space-y-4">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Failed to load your cart. Check your connection and try again.
        </p>
        <button onClick={fetchCart}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-gold)', color: '#000' }}>
          Retry
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen px-4 py-10 md:px-8 lg:px-16"
      style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}>
          Your Cart{' '}
          {!isEmpty && (
            <span className="text-base font-normal ml-1"
              style={{ color: 'var(--color-text-secondary)' }}>
              ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
          )}
        </h1>

        {isEmpty ? <EmptyCart /> : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 w-full">
              {items.map(item => (
                <CartItemRow key={item.id} item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove} />
              ))}
            </div>
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <CartSummary itemCount={items.length} total={total}
                onClearCart={() => setShowClearDlg(true)} />
            </div>
          </div>
        )}
      </div>

      <ClearCartDialog open={showClearDlg} isLoading={isClearing}
        onConfirm={handleClear} onCancel={() => setShowClearDlg(false)} />
    </main>
  )
}

function CartSkeleton() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8 lg:px-16"
      style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="h-9 w-36 rounded-xl mb-8 animate-pulse"
          style={{ background: 'var(--color-surface-2)' }} />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4 w-full">
            {[1,2,3].map(i => (
              <div key={i} className="h-28 rounded-2xl animate-pulse"
                style={{ background: 'var(--color-surface)' }} />
            ))}
          </div>
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="h-72 rounded-2xl animate-pulse"
              style={{ background: 'var(--color-surface)' }} />
          </div>
        </div>
      </div>
    </main>
  )
}