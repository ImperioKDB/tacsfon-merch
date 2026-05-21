'use client';

/**
 * QuantitySelector
 *
 * Minus / number display / plus stepper.
 * Clamps value between 1 and maxQty.
 * Minus disabled at 1, Plus disabled at maxQty.
 */
'use client'

import { Minus, Plus } from 'lucide-react'

interface Props {
  value:    number
  maxQty:   number
  onChange: (value: number) => void
}

export default function QuantitySelector({ value, maxQty, onChange }: Props) {
  const dec = () => onChange(Math.max(1, value - 1))
  const inc = () => onChange(Math.min(maxQty, value + 1))

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={dec}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-all disabled:opacity-40"
        style={{
          background: 'var(--color-surface-2)',
          border:     '1px solid var(--color-border)',
          color:      'var(--color-text-primary)',
        }}
      >
        <Minus size={16} strokeWidth={1.5} />
      </button>

      <div
        className="flex h-11 w-14 items-center justify-center rounded-xl text-base font-semibold"
        style={{
          background: 'var(--color-surface)',
          border:     '1px solid var(--color-border)',
          color:      'var(--color-text-primary)',
        }}
      >
        {value}
      </div>

      <button
        onClick={inc}
        disabled={value >= maxQty}
        aria-label="Increase quantity"
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-all disabled:opacity-40"
        style={{
          background: 'var(--color-surface-2)',
          border:     '1px solid var(--color-border)',
          color:      'var(--color-text-primary)',
        }}
      >
        <Plus size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
