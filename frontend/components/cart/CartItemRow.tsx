'use client'

/**
 * CartItemRow — Phase 6
 * Inline CSS only — no Tailwind utility classes.
 */

import Image          from 'next/image'
import { Trash2 }     from 'lucide-react'
import { formatPrice, resolveImageUrl } from '@/lib/utils/formatters'

interface CartItemRowProps {
  id:               string
  name:             string
  variantLabel:     string
  unitPrice:        number
  quantity:         number
  imageUrl:         string | null
  onQuantityChange: (id: string, qty: number) => void
  onRemove:         (id: string) => void
  isUpdating?:      boolean
}

export default function CartItemRow({
  id, name, variantLabel, unitPrice, quantity,
  imageUrl, onQuantityChange, onRemove, isUpdating = false,
}: CartItemRowProps) {
  const imgSrc = resolveImageUrl(imageUrl)

  const qtyBtn: React.CSSProperties = {
    width: '32px', height: '32px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', color: 'var(--text-primary)',
    cursor: 'pointer', fontSize: '16px', fontFamily: 'var(--font-body)',
    fontWeight: 400, lineHeight: 1, flexShrink: 0, transition: 'border-color 150ms',
  }

  return (
    <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)', opacity: isUpdating ? 0.5 : 1, transition: 'opacity 200ms' }}>

      {/* Thumbnail */}
      <div style={{ width: '80px', height: '96px', flexShrink: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        {imgSrc
          ? <Image src={imgSrc} alt={name} fill unoptimized style={{ objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)' }} />
        }
      </div>

      {/* Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </p>

        {variantLabel && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
            {variantLabel}
          </p>
        )}

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: '#3DBA6F', margin: '4px 0 0 0' }}>
          {formatPrice(unitPrice * quantity)}
          {quantity > 1 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
              ({formatPrice(unitPrice)} each)
            </span>
          )}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => quantity > 1 ? onQuantityChange(id, quantity - 1) : onRemove(id)} aria-label="Decrease quantity" style={{ ...qtyBtn, borderRight: 'none' }}>
              {quantity === 1 ? <Trash2 size={12} strokeWidth={1.5} /> : '−'}
            </button>
            <div style={{ width: '40px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', userSelect: 'none' }}>
              {quantity}
            </div>
            <button onClick={() => onQuantityChange(id, quantity + 1)} aria-label="Increase quantity" style={{ ...qtyBtn, borderLeft: 'none' }}>
              +
            </button>
          </div>

          <button onClick={() => onRemove(id)} aria-label="Remove item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 0' }}>
            <Trash2 size={12} strokeWidth={1.5} /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}
