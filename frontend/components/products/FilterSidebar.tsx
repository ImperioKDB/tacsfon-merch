'use client';

/**
 * FilterSidebar (Desktop)
 *
 * Sticky left panel — category, size, stock type, sort.
 * Every change updates URL params via next/navigation.
 */
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback }                              from 'react'
import { SlidersHorizontal, X }                    from 'lucide-react'

const SIZES     = ['S', 'M', 'L', 'XL', 'One Size']
const SORT_OPTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]
const STOCK_OPTS = [
  { value: '',         label: 'All' },
  { value: 'stock',    label: 'In Stock' },
  { value: 'preorder', label: 'Pre-order' },
]

interface Category { id: string; name: string }

interface Props {
  categories:      Category[]
  activeCategory:  string
  activeSize:      string
  activeStockType: string
  activeSort:      string
}

export default function FilterSidebar({
  categories, activeCategory, activeSize, activeStockType, activeSort,
}: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) { params.set(key, value) } else { params.delete(key) }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const hasFilters =
    activeCategory || activeSize || activeStockType || (activeSort && activeSort !== 'newest')

  return (
    <div className="sticky top-24 space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} strokeWidth={1.5} style={{ color: 'var(--color-gold)' }} />
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Filters
          </span>
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--color-gold)' }}
          >
            <X size={12} strokeWidth={1.5} /> Clear
          </button>
        )}
      </div>

      {/* Sort */}
      <Section title="Sort By">
        {SORT_OPTS.map(opt => (
          <RowBtn
            key={opt.value}
            label={opt.label}
            active={activeSort === opt.value || (!activeSort && opt.value === 'newest')}
            onClick={() => updateParam('sort', opt.value)}
          />
        ))}
      </Section>

      {/* Categories */}
      {categories.length > 0 && (
        <Section title="Category">
          <RowBtn label="All Categories" active={!activeCategory} onClick={() => updateParam('category', '')} />
          {categories.map(cat => (
            <RowBtn
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => updateParam('category', cat.id)}
            />
          ))}
        </Section>
      )}

      {/* Sizes */}
      <Section title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => updateParam('size', activeSize === size ? '' : size)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{
                background: activeSize === size ? 'var(--color-gold)' : 'var(--color-surface-2)',
                color:      activeSize === size ? '#0A0A0F' : 'var(--color-text-secondary)',
                border:     `1px solid ${activeSize === size ? 'var(--color-gold)' : 'var(--color-border)'}`,
                minHeight:  '36px',
                minWidth:   '44px',
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability">
        {STOCK_OPTS.map(opt => (
          <RowBtn
            key={opt.value}
            label={opt.label}
            active={activeStockType === opt.value}
            onClick={() => updateParam('stock_type', opt.value)}
          />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-disabled)' }}>
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function RowBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm"
      style={{
        background: active ? 'var(--color-gold-muted)' : 'transparent',
        color:      active ? 'var(--color-gold)' : 'var(--color-text-secondary)',
        border:     active ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
      }}
    >
      {label}
    </button>
  )
}
