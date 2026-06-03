'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect }                  from 'react'
import { X, SlidersHorizontal }                    from 'lucide-react'

interface Category {
  id:   string
  name: string
}

interface FilterBottomSheetProps {
  categories: Category[]
  open:       boolean
  onClose:    () => void
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'    },
  { value: 'price_asc',  label: 'Price: Low–High'  },
  { value: 'price_desc', label: 'Price: High–Low'  },
  { value: 'name_asc',   label: 'Name A–Z'         },
]

const STOCK_OPTIONS = [
  { value: 'all',      label: 'All'       },
  { value: 'in_stock', label: 'In Stock'  },
  { value: 'preorder', label: 'Pre-order' },
]

export default function FilterBottomSheet({ categories, open, onClose }: FilterBottomSheetProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const activeCategory = params.get('category') ?? 'all'
  const activeSort     = params.get('sort')     ?? 'newest'
  const activeStock    = params.get('stock')    ?? 'all'

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === 'all' || value === 'newest') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    router.push(`${pathname}?${next.toString()}`)
  }, [params, pathname, router])

  const clearAll = () => {
    router.push(pathname)
    onClose()
  }

  const hasFilters = params.has('category') || params.has('sort') || params.has('stock')

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: '80dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px 12px 0 0',
        }}
      >
        {/* Handle */}
        <div
          aria-hidden="true"
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--bg-elevated)',
            margin: '12px auto 0',
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--accent)' }} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
              }}
            >
              Filter &amp; Sort
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {hasFilters && (
              <button
                onClick={clearAll}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  minHeight: '44px',
                }}
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close filter sheet"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>

          {/* ── Category ── */}
          <SheetSection label="Category">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[{ id: 'all', name: 'All' }, ...categories].map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  active={cat.id === activeCategory}
                  onClick={() => update('category', cat.id)}
                />
              ))}
            </div>
          </SheetSection>

          {/* ── Sort ── */}
          <SheetSection label="Sort By">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SORT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={opt.value === activeSort}
                  onClick={() => update('sort', opt.value)}
                />
              ))}
            </div>
          </SheetSection>

          {/* ── Availability ── */}
          <SheetSection label="Availability">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STOCK_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={opt.value === activeStock}
                  onClick={() => update('stock', opt.value)}
                />
              ))}
            </div>
          </SheetSection>
        </div>

        {/* Done button */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '16px',
              cursor: 'pointer',
              minHeight: '52px',
              transition: 'background 150ms ease',
            }}
          >
            View Results
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Sub-components ── */

function SheetSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '12px',
        }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.06em',
        color: active ? '#000' : 'var(--text-muted)',
        background: active ? 'var(--accent)' : 'var(--bg-elevated)',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        padding: '8px 16px',
        cursor: 'pointer',
        minHeight: '44px',
        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
        borderRadius: '2px',
      }}
    >
      {label}
    </button>
  )
}
