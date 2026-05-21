'use client';

/**
 * FilterBottomSheet (Mobile)
 *
 * Slide-up sheet triggered by the mobile Filters button.
 * Same options as FilterSidebar — pushes to URL params.
 * Framer Motion handles the slide-up animation.
 */
'use client'

import { useEffect }                               from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal }                    from 'lucide-react'
import { motion, AnimatePresence }                 from 'framer-motion'

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
  isOpen:          boolean
  onClose:         () => void
  categories:      Category[]
  activeCategory:  string
  activeSize:      string
  activeStockType: string
  activeSort:      string
}

export default function FilterBottomSheet({
  isOpen, onClose, categories,
  activeCategory, activeSize, activeStockType, activeSort,
}: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) { params.set(key, value) } else { params.delete(key) }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl px-5 pb-10 pt-5"
            style={{
              background:   'var(--color-surface)',
              border:       '1px solid var(--color-border)',
              borderBottom: 'none',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-12 rounded-full" style={{ background: 'var(--color-border)' }} />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} strokeWidth={1.5} style={{ color: 'var(--color-gold)' }} />
                <span
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-urbanist)' }}
                >
                  Filter & Sort
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2"
                style={{ minHeight: '44px', minWidth: '44px', background: 'var(--color-surface-2)' }}
                aria-label="Close filters"
              >
                <X size={18} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>

            {/* Sort */}
            <SheetSection title="Sort By">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTS.map(opt => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={activeSort === opt.value || (!activeSort && opt.value === 'newest')}
                    onClick={() => updateParam('sort', opt.value)}
                  />
                ))}
              </div>
            </SheetSection>

            {/* Categories */}
            {categories.length > 0 && (
              <SheetSection title="Category">
                <div className="flex flex-wrap gap-2">
                  <Chip label="All" active={!activeCategory} onClick={() => updateParam('category', '')} />
                  {categories.map(cat => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      active={activeCategory === cat.id}
                      onClick={() => updateParam('category', cat.id)}
                    />
                  ))}
                </div>
              </SheetSection>
            )}

            {/* Sizes */}
            <SheetSection title="Size">
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <Chip
                    key={size}
                    label={size}
                    active={activeSize === size}
                    onClick={() => updateParam('size', activeSize === size ? '' : size)}
                  />
                ))}
              </div>
            </SheetSection>

            {/* Availability */}
            <SheetSection title="Availability">
              <div className="flex flex-wrap gap-2">
                {STOCK_OPTS.map(opt => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={activeStockType === opt.value}
                    onClick={() => updateParam('stock_type', opt.value)}
                  />
                ))}
              </div>
            </SheetSection>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { router.push(pathname, { scroll: false }); onClose() }}
                className="flex-1 rounded-xl py-3 text-sm font-semibold"
                style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', minHeight: '44px' }}
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl py-3 text-sm font-semibold"
                style={{ background: 'var(--color-gold)', color: '#0A0A0F', minHeight: '44px' }}
              >
                See Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-disabled)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-2 text-sm font-medium"
      style={{
        background: active ? 'var(--color-gold)' : 'var(--color-surface-2)',
        color:      active ? '#0A0A0F' : 'var(--color-text-secondary)',
        border:     `1px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
        minHeight:  '44px',
      }}
    >
      {label}
    </button>
  )
}
