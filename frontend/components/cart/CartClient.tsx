'use client'

/**
 * CartClient — Phase 6
 *
 * Orchestrates the /cart page.
 * Inline CSS only — no Tailwind utility classes.
 */

import { useState, useEffect, useCallback } from 'react'
import { toast }                             from 'sonner'
import { apiFetch }                          from '@/lib/api/fetch'
import { useCartStore }                      from '@/store/cart'
import CartItemRow                           from './CartItemRow'
import CartSummary                           from './CartSummary'
import ClearCartDialog                       from './ClearCartDialog'
import EmptyCart                             from './EmptyCart'

interface CartVariant {
  id:             string
  size:           string | null
  color:          string | null
  price_override: number | null
  product?: {
    name:       string
    base_price: number
    image_url:  string | null
  }
}

interface CartItem {
  id:         string
  variant_id: string
  quantity:   number
  unit_price: number
  variant?:   CartVariant
}

interface CartData {
  id:    string
  items: CartItem[]
  total: number
}

function buildVariantLabel(v: CartVariant | undefined): string {
  if (!v) return ''
  const parts = []
  if (v.size  && v.size  !== 'Default') parts.push(v.size)
  if (v.color && v.color !== 'Default') parts.push(v.color)
  return parts.join(' · ')
}

export default function CartClient() {
  const [cart,         setCart]         = useState<CartData | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [updatingId,   setUpdatingId]   = useState<string | null>(null)
  const [showClearDlg, setShowClearDlg] = useState(false)
  const [isClearing,   setIsClearing]   = useState(false)

  const setCartCount = useCartStore(s => s.setCount)

  const fetchCart = useCallback(async () => {
    try {
      const data = await apiFetch<CartData>('/cart')
      setCart(data)
      const count = (data.items ?? []).reduce((acc, i) => acc + i.quantity, 0)
      setCartCount(count)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [setCartCount])

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleQuantityChange = async (itemId: string, qty: number) => {
    setUpdatingId(itemId)
    try {
      await apiFetch(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity: qty }) })
      await fetchCart()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update quantity')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId)
    try {
      await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' })
      await fetchCart()
      toast.success('Item removed')
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove item')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleClearCart = async () => {
    setShowClearDlg(false)
    setIsClearing(true)
    try {
      const items = cart?.items ?? []
      await Promise.all(items.map(i => apiFetch(`/cart/items/${i.id}`, { method: 'DELETE' })))
      await fetchCart()
      toast.success('Cart cleared')
    } catch (e: any) {
      toast.error(e.message || 'Failed to clear cart')
    } finally {
      setIsClearing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ height: '32px', width: '160px', background: 'var(--bg-surface)', marginBottom: '32px', animation: 'pulse 1.4s ease infinite' }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '96px', background: 'var(--bg-surface)', flexShrink: 0, animation: 'pulse 1.4s ease infinite' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ height: '20px', width: '70%', background: 'var(--bg-surface)', animation: 'pulse 1.4s ease infinite' }} />
              <div style={{ height: '14px', width: '40%', background: 'var(--bg-surface)', animation: 'pulse 1.4s ease infinite' }} />
              <div style={{ height: '18px', width: '30%', background: 'var(--bg-surface)', animation: 'pulse 1.4s ease infinite' }} />
            </div>
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    )
  }

  const items     = cart?.items ?? []
  if (items.length === 0) return <EmptyCart />

  const subtotal  = cart?.total ?? items.reduce((a, i) => a + i.unit_price * i.quantity, 0)
  const itemCount = items.reduce((a, i) => a + i.quantity, 0)

  return (
    <>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px 240px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 48px)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
          Your Cart
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 32px 0' }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)', marginBottom: '8px' }} />

        {items.map(item => (
          <CartItemRow
            key={item.id}
            id={item.id}
            name={item.variant?.product?.name ?? 'Product'}
            variantLabel={buildVariantLabel(item.variant)}
            unitPrice={item.unit_price}
            quantity={item.quantity}
            imageUrl={item.variant?.product?.image_url ?? null}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            isUpdating={updatingId === item.id}
          />
        ))}
      </div>

      <CartSummary
        subtotal={subtotal}
        itemCount={itemCount}
        onClearCart={() => setShowClearDlg(true)}
        isClearing={isClearing}
      />

      {showClearDlg && (
        <ClearCartDialog
          onConfirm={handleClearCart}
          onCancel={() => setShowClearDlg(false)}
        />
      )}
    </>
  )
}
