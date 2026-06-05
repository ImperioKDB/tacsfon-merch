'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback }                              from 'react'
import { SlidersHorizontal }                       from 'lucide-react'

interface Category {
  id:   string
  name: string
}

interface FilterSidebarProps {
  categories: Category[]
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

export default function FilterSidebar({ categories }: FilterSidebarProps) {
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
  }, [params, pathname, router])

  const clearAll  = () => router.push(pathname)
  const hasFilters = params.has('category') || params.has('sort') || params.has('stock')

  return (
    <aside
      style={{
        width:      '220px',
        flexShrink: 0,
        position:   'sticky',
        top:        '96px',
        alignSelf:  'flex-start',
        display:    'none',
      }}
      className="filter-sidebar"
    >
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   '24px',
        paddingBottom:  '16px',
        borderBottom:   '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--accent)' }} />
          <span style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '11px',
            fontWeight:    600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
          }}>
            Filter
          </span>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              fontFamily:     'var(--font-body)',
              fontSize:       '11px',
              color:          'var(--accent)',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              letterSpacing:  '0.08em',
              textDecoration: 'underline',
              padding:        0,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection label="Category">
        {[{ id: 'all', name: 'All' }, ...categories].map(cat => (
          <FilterRow
            key={cat.id}
            label={cat.name}
            active={cat.id === activeCategory}
            onClick={() => update('category', cat.id)}
          />
        ))}
      </FilterSection>

      {/* Sort */}
      <FilterSection label="Sort By">
        {SORT_OPTIONS.map(opt => (
          <FilterRow
            key={opt.value}
            label={opt.label}
            active={opt.value === activeSort}
            onClick={() => update('sort', opt.value)}
          />
        ))}
      </FilterSection>

      {/* Availability */}
      <FilterSection label="Availability">
        {STOCK_OPTIONS.map(opt => (
          <FilterRow
            key={opt.value}
            label={opt.label}
            active={opt.value === activeStock}
            onClick={() => update('stock', opt.value)}
          />
        ))}
      </FilterSection>

      <style>{`
        @media (min-width: 1024px) {
          .filter-sidebar { display: block !important; }
        }
      `}</style>
    </aside>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {children}
      </div>
    </div>
  )
}

function FilterRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '10px',
        width:      '100%',
        padding:    '8px 0',
        background: 'none',
        border:     'none',
        cursor:     'pointer',
        textAlign:  'left',
      }}
    >
      <span style={{
        width:        '14px',
        height:       '14px',
        borderRadius: '50%',
        border:       active ? '4px solid var(--accent)' : '1px solid var(--border)',
        flexShrink:   0,
        transition:   'border 150ms ease',
      }} />
      <span style={{
        fontFamily:  'var(--font-body)',
        fontSize:    '13px',
        color:       active ? 'var(--text-primary)' : 'var(--text-muted)',
        fontWeight:  active ? 600 : 400,
        transition:  'color 150ms ease',
      }}>
        {label}
      </span>
    </button>
  )
}
