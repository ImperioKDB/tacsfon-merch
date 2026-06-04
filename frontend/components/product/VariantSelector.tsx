'use client'

/**
 * VariantSelector — Phase 5
 *
 * Renders size chips and colour swatches for selecting a product variant.
 * - Selected chip: gold border + gold text + subtle gold bg tint
 * - Out-of-stock variant: muted + strikethrough, not selectable
 * - Colour swatches: circular 36px buttons, gold ring when selected
 * - Uses resolveColor from merch-colors.ts for accurate swatch hex
 * - Inline CSS only — no Tailwind utility classes
 */

import { Check }               from 'lucide-react'
import type { ProductVariant } from '@/types'
import { resolveColor }        from '@/lib/utils/merch-colors'

interface Props {
  variants:   ProductVariant[]
  selectedId: string | null
  onSelect:   (variant: ProductVariant) => void
}

function uniqueBy<T>(items: T[], key: (item: T) => string | null | undefined): T[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const k = key(item)
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function isOutOfStock(variants: ProductVariant[], dim: 'size' | 'color', value: string): boolean {
  return variants.filter(v => v[dim] === value).every(v => v.stock_qty === 0)
}

export default function VariantSelector({ variants, selectedId, onSelect }: Props) {
  const sizes  = uniqueBy(variants, v => v.size)
  const colors = uniqueBy(variants, v => v.color)

  const hasSizes  = sizes.some(v => v.size)
  const hasColors = colors.some(v => v.color && v.color !== 'Default')

  const selectedVariant = variants.find(v => v.id === selectedId) ?? null

  function selectBySize(size: string) {
    const match =
      variants.find(v => v.size === size && v.color === selectedVariant?.color && v.stock_qty > 0) ??
      variants.find(v => v.size === size && v.stock_qty > 0) ??
      variants.find(v => v.size === size)
    if (match) onSelect(match)
  }

  function selectByColor(color: string) {
    const match =
      variants.find(v => v.color === color && v.size === selectedVariant?.size && v.stock_qty > 0) ??
      variants.find(v => v.color === color && v.stock_qty > 0) ??
      variants.find(v => v.color === color)
    if (match) onSelect(match)
  }

  const labelStyle: React.CSSProperties = {
    marginBottom:  '10px',
    fontSize:      '10px',
    fontFamily:    'var(--font-body)',
    fontWeight:    700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color:         'var(--text-muted)',
    display:       'flex',
    alignItems:    'center',
    gap:           '8px',
  }

  const subLabelStyle: React.CSSProperties = {
    fontWeight:    400,
    letterSpacing: 'normal',
    textTransform: 'none',
    color:         'var(--text-primary)',
    fontSize:      '12px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {hasSizes && (
        <div>
          <p style={labelStyle}>
            Size
            {selectedVariant?.size && (
              <span style={subLabelStyle}>— {selectedVariant.size}</span>
            )}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sizes.map(v => {
              if (!v.size) return null
              const oos      = isOutOfStock(variants, 'size', v.size)
              const selected = selectedVariant?.size === v.size
              return (
                <button
                  key={v.id}
                  disabled={oos}
                  onClick={() => selectBySize(v.size!)}
                  aria-label={`Size ${v.size}${oos ? ' — out of stock' : ''}`}
                  style={{
                    position:       'relative',
                    minWidth:       '48px',
                    minHeight:      '48px',
                    padding:        '0 16px',
                    border:         selected ? '1px solid #3DBA6F' : '1px solid var(--border)',
                    background:     selected ? 'rgba(201,168,76,0.10)' : 'var(--bg-surface)',
                    color:          oos ? 'var(--text-muted)' : selected ? '#3DBA6F' : 'var(--text-primary)',
                    fontFamily:     'var(--font-body)',
                    fontSize:       '13px',
                    fontWeight:     selected ? 700 : 500,
                    letterSpacing:  '0.06em',
                    textDecoration: oos ? 'line-through' : 'none',
                    cursor:         oos ? 'not-allowed' : 'pointer',
                    opacity:        oos ? 0.45 : 1,
                    transition:     'border-color 150ms, background 150ms, color 150ms',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  {v.size}
                  {selected && (
                    <span style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', color: '#3DBA6F' }}>
                      <Check size={8} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {hasColors && (
        <div>
          <p style={labelStyle}>
            Color
            {selectedVariant?.color && selectedVariant.color !== 'Default' && (
              <span style={subLabelStyle}>— {selectedVariant.color}</span>
            )}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {colors.map(v => {
              if (!v.color || v.color === 'Default') return null
              const oos      = isOutOfStock(variants, 'color', v.color)
              const selected = selectedVariant?.color === v.color
              const hex      = resolveColor(v.color)
              const isLight  = ['white', 'cream', 'beige', 'yellow'].includes(v.color.toLowerCase())
              return (
                <button
                  key={v.id}
                  disabled={oos}
                  onClick={() => selectByColor(v.color!)}
                  title={v.color}
                  aria-label={`Color: ${v.color}${oos ? ' — out of stock' : ''}`}
                  style={{
                    position:       'relative',
                    width:          '36px',
                    height:         '36px',
                    borderRadius:   '50%',
                    background:     hex,
                    border:         '1px solid rgba(255,255,255,0.12)',
                    boxShadow:      selected ? '0 0 0 2px var(--bg-base), 0 0 0 4px #3DBA6F' : 'none',
                    opacity:        oos ? 0.3 : 1,
                    cursor:         oos ? 'not-allowed' : 'pointer',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    transition:     'box-shadow 150ms, opacity 150ms',
                    flexShrink:     0,
                  }}
                >
                  {selected && <Check size={14} strokeWidth={2.5} style={{ color: isLight ? '#0A0A0A' : '#ffffff' }} />}
                  {oos && (
                    <div
                      style={{
                        position:       'absolute',
                        inset:          0,
                        borderRadius:   '50%',
                        background:     'rgba(10,10,10,0.55)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg)' }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
