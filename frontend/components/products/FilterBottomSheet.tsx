'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback }                              from 'react'
import { SlidersHorizontal, X }                    from 'lucide-react'

interface Category { id: string; name: string }

interface Props {
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

export default function FilterBottomSheet({ categories, open, onClose }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const activeCategory = params.get('category') ?? 'all'
  const activeSort     = params.get('sort')     ?? 'newest'
  const activeStock    = params.get('stock')    ?? 'all'

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === 'all' || value === 'newest') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    router.push(`${pathname}?${next.toString()}`)
    onClose()
  }, [params, pathname, router, onClose])

  const clearAll = () => { router.push(pathname); onClose() }
  const hasFilters = params.has('category') || params.has('sort') || params.has('stock')

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     200,
          background: 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        zIndex:        201,
        background:    'var(--bg-surface)',
        borderTop:     '1px solid var(--border)',
        borderRadius:  '16px 16px 0 0',
        maxHeight:     '80dvh',
        overflowY:     'auto',
        /* Critical: pad bottom so content clears the 62px BottomNav */
        paddingBottom: '80px',
      }}>
        {/* Handle */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          paddingTop:     '12px',
          paddingBottom:  '4px',
        }}>
          <div style={{
            width:        '36px',
            height:       '4px',
            borderRadius: '2px',
            background:   'var(--border)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '12px 20px 16px',
          borderBottom:   '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={15} style={{ color: 'var(--accent)' }} />
            <span style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '13px',
              fontWeight:    700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         'var(--text-primary)',
            }}>
              Filter &amp; Sort
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasFilters && (
              <button onClick={clearAll} style={{
                fontFamily:     'var(--font-body)',
                fontSize:       '11px',
                color:          'var(--accent)',
                background:     'none',
                border:         'none',
                cursor:         'pointer',
                letterSpacing:  '0.08em',
                textDecoration: 'underline',
                padding:        0,
              }}>
                Clear
              </button>
            )}
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', padding: '4px',
            }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>

          {/* Category */}
          <FilterSection label="Category">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[{ id: 'all', name: 'All' }, ...categories].map(cat => (
                <FilterChip
                  key={cat.id}
                  label={cat.name}
                  active={cat.id === activeCategory}
                  onClick={() => update('category', cat.id)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Sort */}
          <FilterSection label="Sort By">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SORT_OPTIONS.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={opt.value === activeSort}
                  onClick={() => update('sort', opt.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection label="Availability">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STOCK_OPTIONS.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={opt.value === activeStock}
                  onClick={() => update('stock', opt.value)}
                />
              ))}
            </div>
          </FilterSection>

        </div>
      </div>
    </>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        fontFamily:    'var(--font-body)',
        fontSize:      '10px',
        fontWeight:    600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color:         'var(--text-muted)',
        marginBottom:  '12px',
      }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:       '8px 16px',
        fontFamily:    'var(--font-body)',
        fontSize:      '13px',
        fontWeight:    active ? 700 : 400,
        background:    active ? 'var(--accent)'    : 'var(--bg-elevated)',
        color:         active ? '#0A0A0A'           : 'var(--text-primary)',
        border:        active ? '1px solid var(--accent)' : '1px solid var(--border)',
        cursor:        'pointer',
        transition:    'all 150ms ease',
        whiteSpace:    'nowrap',
        borderRadius:  '4px',
      }}
    >
      {label}
    </button>
  )
}
