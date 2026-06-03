'use client'

/**
 * QuantitySelector — Phase 5
 *
 * Minimal − / count / + stepper.
 * - Clamps between 1 and 9 999 (bulk ordering enabled)
 * - Minus disabled at 1
 * - Inline CSS only — no Tailwind utility classes
 */

import { Minus, Plus } from 'lucide-react'

interface Props {
  value:    number
  onChange: (value: number) => void
  maxQty?:  number
}

export default function QuantitySelector({ value, onChange, maxQty = 9999 }: Props) {
  const dec = () => onChange(Math.max(1,      value - 1))
  const inc = () => onChange(Math.min(maxQty, value + 1))

  const btnBase: React.CSSProperties = {
    width:          '44px',
    height:         '44px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'var(--bg-surface)',
    border:         '1px solid var(--border)',
    color:          'var(--text-primary)',
    cursor:         'pointer',
    transition:     'border-color 150ms, color 150ms',
    flexShrink:     0,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '44px', width: 'fit-content' }}>
      <button
        onClick={dec}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        style={{ ...btnBase, borderRight: 'none', opacity: value <= 1 ? 0.35 : 1, cursor: value <= 1 ? 'not-allowed' : 'pointer' }}
      >
        <Minus size={14} strokeWidth={2} />
      </button>

      <div
        style={{
          width:          '56px',
          height:         '44px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'var(--bg-surface)',
          border:         '1px solid var(--border)',
          color:          'var(--text-primary)',
          fontFamily:     'var(--font-body)',
          fontSize:       '15px',
          fontWeight:     600,
          userSelect:     'none',
        }}
      >
        {value}
      </div>

      <button
        onClick={inc}
        disabled={value >= maxQty}
        aria-label="Increase quantity"
        style={{ ...btnBase, borderLeft: 'none', opacity: value >= maxQty ? 0.35 : 1, cursor: value >= maxQty ? 'not-allowed' : 'pointer' }}
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
