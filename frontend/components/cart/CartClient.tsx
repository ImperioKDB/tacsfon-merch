'use client'

import { useEffect, useState, useCallback } from 'react'
import Link                                 from 'next/link'
import Image                                from 'next/image'
import { Trash2, ShoppingBag }              from 'lucide-react'
import { toast }                            from 'sonner'
import { useCartStore }                     from '@/store/cart'
import { apiFetch }                         from '@/lib/api/fetch'
import { formatPrice }                      from '@/lib/utils/formatters'

interface Variant {
  id:             string
  size:           string
  color:          string
  price_override: number | null
  product: {
    id:         string
    name:       string
    base_price: number
    image_url:  string | null
  }
}

interface CartItem {
  id:       string
  quantity: number
  variant:  Variant
}

export default function CartClient() {
  const [items,   setItems]   = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const setCount              = useCartStore((s) => s.setCount)

  // useCallback so fetchCart is stable and safe to list as a useEffect dep
  const fetchCart = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: CartItem[] }>('/cart')
      setItems(res.data ?? [])
      setCount((res.data ?? []).reduce((n, i) => n + i.quantity, 0))
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [setCount])

  useEffect(() => { fetchCart() }, [fetchCart])

  const removeItem = async (id: string) => {
    try {
      await apiFetch(`/cart/items/${id}`, { method: 'DELETE' })
      await fetchCart()
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const updateQty = async (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id)
    try {
      await apiFetch(`/cart/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      })
      await fetchCart()
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.price_override ?? item.variant.product.base_price
    return sum + price * item.quantity
  }, 0)

  if (loading) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading cart…
      </div>
    )
  }

  if (!items.length) {
    return (
      <div
        style={{
          padding: '96px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}
        >
          YOUR CART IS EMPTY
        </p>
        <Link
          href="/products"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#000',
            background: 'var(--accent)',
            padding: '14px 32px',
            textDecoration: 'none',
          }}
        >
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5vw, 56px)',
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
          marginBottom: '40px',
        }}
      >
        YOUR CART
      </h1>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
        {items.map((item) => {
          const price  = item.variant.price_override ?? item.variant.product.base_price
          const imgSrc = item.variant.product.image_url
          const name   = item.variant.product.name

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-base)',
                display: 'flex',
                gap: '20px',
                padding: '20px',
                alignItems: 'flex-start',
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  position: 'relative',
                  width: '80px',
                  height: '107px',
                  flexShrink: 0,
                  background: 'var(--bg-elevated)',
                  overflow: 'hidden',
                }}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingBag size={20} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.variant.size} · {item.variant.color}
                </p>

                {/* Qty stepper + price row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                    {[
                      { label: '−', action: () => updateQty(item.id, item.quantity - 1) },
                      { label: String(item.quantity), action: null },
                      { label: '+', action: () => updateQty(item.id, item.quantity + 1) },
                    ].map(({ label, action }, i) =>
                      action === null ? (
                        <span
                          key="qty"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            padding: '6px 14px',
                            borderLeft: '1px solid var(--border)',
                            borderRight: '1px solid var(--border)',
                            minWidth: '40px',
                            textAlign: 'center',
                          }}
                        >
                          {label}
                        </span>
                      ) : (
                        <button
                          key={i}
                          onClick={action}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '6px 12px',
                            fontSize: '16px',
                            minWidth: '36px',
                            minHeight: '36px',
                          }}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      {formatPrice(price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${name}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        minWidth: '36px',
                        minHeight: '36px',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: '1px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Subtotal
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {formatPrice(subtotal)}
          </span>
        </div>
        <Link
          href="/checkout"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#000',
            background: 'var(--accent)',
            padding: '18px',
            textDecoration: 'none',
          }}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
}
