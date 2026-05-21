'use client';

/**
 * VariantSelector
 *
 * Renders size chips and color swatches for selecting a product variant.
 * - Selected chip: gold border + checkmark
 * - Out-of-stock variant: muted + strikethrough text, not selectable
 * - Color swatches: circular buttons, gold ring when selected
 */
'use client'

import { Check } from 'lucide-react'
import type { ProductVariant } from '@/types'

interface Props {
  variants:        ProductVariant[]
  selectedId:      string | null
  onSelect:        (variant: ProductVariant) => void
}

// Derive unique sizes and colours from variant list
function getUniqueSizes(variants: ProductVariant[]) {
  const seen = new Set<string>()
  return variants.filter(v => {
    if (!v.size || seen.has(v.size)) return false
    seen.add(v.size)
    return true
  })
}

function getUniqueColors(variants: ProductVariant[]) {
  const seen = new Set<string>()
  return variants.filter(v => {
    if (!v.color || seen.has(v.color)) return false
    seen.add(v.color)
    return true
  })
}

// Map common colour names to CSS values for swatches
const COLOR_MAP: Record<string, string> = {
  white:   '#F7F5F0', black:  '#0A0A0F', red:    '#D94F4F',
  yellow:  '#E8A830', blue:   '#3B82F6', green:  '#2D9E6B',
  pink:    '#EC4899', purple: '#8B5CF6', grey:   '#6B7280',
  gray:    '#6B7280', navy:   '#1E3A8A', orange: '#F97316',
  brown:   '#92400E',
}

function getCssColor(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] ?? '#6B7280'
}

export default function VariantSelector({ variants, selectedId, onSelect }: Props) {
  const sizes  = getUniqueSizes(variants)
  const colors = getUniqueColors(variants)

  const hasSizes  = sizes.length > 0
  const hasColors = colors.length > 0

  // Find the variant that matches a given size or color selection,
  // carrying over the other dimension from the currently selected variant
  const selectedVariant = variants.find(v => v.id === selectedId) ?? null

  function selectBySize(size: string) {
    // Prefer a variant matching size + current color; fall back to size-only match
    const match =
      variants.find(v => v.size === size && v.color === selectedVariant?.color) ??
      variants.find(v => v.size === size)
    if (match) onSelect(match)
  }

  function selectByColor(color: string) {
    const match =
      variants.find(v => v.color === color && v.size === selectedVariant?.size) ??
      variants.find(v => v.color === color)
    if (match) onSelect(match)
  }

  function isOutOfStock(dim: 'size' | 'color', value: string) {
    return variants
      .filter(v => v[dim] === value)
      .every(v => v.stock_qty === 0)
  }

  return (
    <div className="space-y-5">

      {/* Sizes */}
      {hasSizes && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-disabled)' }}>
            Size
            {selectedVariant?.size && (
              <span className="ml-2 normal-case tracking-normal" style={{ color: 'var(--color-text-secondary)' }}>
                — {selectedVariant.size}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(v => {
              const oos      = isOutOfStock('size', v.size!)
              const selected = selectedVariant?.size === v.size
              return (
                <button
                  key={v.id}
                  disabled={oos}
                  onClick={() => selectBySize(v.size!)}
                  className="relative rounded-xl px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: selected ? 'var(--color-gold-muted)' : 'var(--color-surface-2)',
                    color:      oos
                      ? 'var(--color-text-disabled)'
                      : selected ? 'var(--color-gold)' : 'var(--color-text-primary)',
                    border: selected
                      ? '1px solid var(--color-gold)'
                      : '1px solid var(--color-border)',
                    minHeight: '44px',
                    minWidth:  '44px',
                    opacity:   oos ? 0.5 : 1,
                    textDecoration: oos ? 'line-through' : 'none',
                    cursor:    oos ? 'not-allowed' : 'pointer',
                  }}
                >
                  {selected && (
                    <Check
                      size={10}
                      strokeWidth={2.5}
                      className="absolute right-1.5 top-1.5"
                      style={{ color: 'var(--color-gold)' }}
                    />
                  )}
                  {v.size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      {hasColors && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-disabled)' }}>
            Color
            {selectedVariant?.color && (
              <span className="ml-2 normal-case tracking-normal" style={{ color: 'var(--color-text-secondary)' }}>
                — {selectedVariant.color}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map(v => {
              const oos      = isOutOfStock('color', v.color!)
              const selected = selectedVariant?.color === v.color
              const css      = getCssColor(v.color!)
              return (
                <button
                  key={v.id}
                  disabled={oos}
                  onClick={() => selectByColor(v.color!)}
                  title={v.color!}
                  aria-label={`Color: ${v.color}`}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all"
                  style={{
                    background: css,
                    boxShadow:  selected ? `0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-gold)` : 'none',
                    opacity:    oos ? 0.35 : 1,
                    cursor:     oos ? 'not-allowed' : 'pointer',
                    border:     `1px solid rgba(255,255,255,0.15)`,
                  }}
                >
                  {selected && (
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      style={{ color: css === '#F7F5F0' ? '#0A0A0F' : '#ffffff' }}
                    />
                  )}
                  {oos && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(10,10,15,0.5)' }}
                    />
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
