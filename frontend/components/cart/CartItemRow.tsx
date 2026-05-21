'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import Image from 'next/image'
import { Trash2, Minus, Plus } from 'lucide-react'
import type { CartItem } from '@/types'

interface Props {
  item:             CartItem
  onQuantityChange: (id: string, qty: number) => void
  onRemove:         (id: string) => void
}

export default function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
  const [qty,      setQty]      = useState(item.quantity)
  const [removing, setRemoving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQty(item.quantity) }, [item.quantity])

  const product   = item.variant?.product
  const variant   = item.variant
  const maxQty    = variant?.stock_qty ?? 99
  const unitPrice = variant?.price_override ?? product?.base_price ?? 0
  const fmt       = (n: number) => `₦${n.toLocaleString('en-NG')}`

  const changeQty = (next: number) => {
    if (next < 1 || next > maxQty) return
    setQty(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onQuantityChange(item.id, next), 300)
  }

  const handleRemove = () => { setRemoving(true); setTimeout(() => onRemove(item.id), 280) }

  return (
    <div className="flex gap-4 p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', opacity: removing ? 0 : 1, transform: removing ? 'translateX(24px)' : 'translateX(0)', transition: 'opacity 280ms ease, transform 280ms ease' }}>
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 80, height: 80, background: 'var(--color-surface-2)' }}>
        {product?.image_url ? (
          <Image src={product.image_url} alt={product.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-disabled)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}>{product?.name ?? 'Product'}</p>
          {(variant?.size || variant?.color) && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{[variant.size, variant.color].filter(Boolean).join(' · ')}</p>
          )}
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-gold)' }}>{fmt(unitPrice)}</p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {[
            { label: 'Decrease quantity', delta: -1, disabled: qty <= 1,      icon: <Minus size={13} /> },
            { label: 'Increase quantity', delta:  1, disabled: qty >= maxQty, icon: <Plus  size={13} /> },
          ].map(({ label, delta, disabled, icon }, i) => (
            <Fragment key={label}>
              {i === 1 && (
                <span className="w-8 text-center text-sm font-semibold tabular-nums select-none" style={{ color: 'var(--color-text-primary)' }}>{qty}</span>
              )}
              <button onClick={() => changeQty(qty + delta)} disabled={disabled} aria-label={label}
                className="flex items-center justify-center w-8 h-8 border"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)', color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
                {icon}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button onClick={handleRemove} aria-label="Remove item" className="p-2"
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-error)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          style={{ color: 'var(--color-text-secondary)' }}>
          <Trash2 size={16} />
        </button>
        <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>{fmt(unitPrice * qty)}</p>
      </div>
    </div>
  )
}
