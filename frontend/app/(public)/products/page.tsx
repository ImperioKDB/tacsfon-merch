'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams }               from 'next/navigation'
import dynamic                           from 'next/dynamic'
import { SlidersHorizontal }             from 'lucide-react'
import { apiFetch }                      from '@/lib/api/fetch'
import ProductsGrid                      from '@/components/products/ProductsGrid'
import ProductsSkeleton                  from '@/components/products/ProductsSkeleton'

/* ── Dynamic imports with ssr:false ──────────────────────────────────────────
   FilterSidebar and FilterBottomSheet both call useRouter / useSearchParams
   / usePathname. These hooks throw if executed during SSR. Wrapping them in
   dynamic(..., { ssr: false }) ensures they only render on the client,
   preventing the server-side crash that was bubbling up to error.tsx.
────────────────────────────────────────────────────────────────────────── */
const FilterSidebar     = dynamic(() => import('@/components/products/FilterSidebar'),     { ssr: false })
const FilterBottomSheet = dynamic(() => import('@/components/products/FilterBottomSheet'), { ssr: false })

interface Variant {
  id:             string
  size:           string
  color:          string
  stock_qty:      number
  price_override: number | null
}

interface Product {
  id:                string
  name:              string
  base_price:        number
  image_url:         string | null
  stock_type:        'stock' | 'preorder' | 'both'
  is_available:      boolean
  product_variants?: Variant[]
}

interface Category {
  id:   string
  name: string
}

function ProductsContent() {
  const params = useSearchParams()

  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [sheetOpen,  setSheetOpen]  = useState(false)

  useEffect(() => {
    const query = new URLSearchParams()
    if (params.get('category')) query.set('category_id', params.get('category')!)
    if (params.get('sort'))     query.set('sort',        params.get('sort')!)
    if (params.get('stock'))    query.set('stock_type',  params.get('stock')!)

    const qs = query.toString()

    setLoading(true)
    setError(null)

    Promise.all([
      apiFetch<{ data: Product[] }>(`/products${qs ? `?${qs}` : ''}`),
      apiFetch<{ data: Category[] }>('/categories'),
    ])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data   ?? (pRes as any) ?? [])
        setCategories(cRes.data ?? (cRes as any) ?? [])
      })
      .catch(err => {
        console.error('[ProductsPage] fetch error:', err)
        setError('Failed to load products. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [params])

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontFamily:    'var(--font-body)',
          fontSize:      '11px',
          fontWeight:    600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         'var(--accent)',
          marginBottom:  '8px',
        }}>
          TACSFON Merch
        </p>

        <div style={{
          display:        'flex',
          alignItems:     'flex-end',
          justifyContent: 'space-between',
          gap:            '16px',
          flexWrap:       'wrap',
        }}>
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(40px, 6vw, 72px)',
            lineHeight:    1,
            letterSpacing: '0.04em',
            color:         'var(--text-primary)',
            margin:        0,
          }}>
            ALL PRODUCTS
          </h1>

          <button
            onClick={() => setSheetOpen(true)}
            className="filter-trigger"
            aria-label="Open filters"
            style={{
              display:       'none',
              alignItems:    'center',
              gap:           '8px',
              fontFamily:    'var(--font-body)',
              fontSize:      '12px',
              fontWeight:    600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         'var(--text-primary)',
              background:    'var(--bg-surface)',
              border:        '1px solid var(--border)',
              padding:       '10px 18px',
              cursor:        'pointer',
              minHeight:     '44px',
            }}
          >
            <SlidersHorizontal size={14} style={{ color: 'var(--accent)' }} />
            Filter
          </button>
        </div>

        <div aria-hidden="true" style={{
          height:     '1px',
          background: 'linear-gradient(90deg, var(--accent), transparent)',
          marginTop:  '20px',
          maxWidth:   '240px',
        }} />
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding:    '48px 0',
          textAlign:  'center',
          fontFamily: 'var(--font-body)',
          fontSize:   '14px',
          color:      'var(--danger)',
        }}>
          <p style={{ marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background:    'none',
              border:        '1px solid var(--border)',
              color:         'var(--text-muted)',
              padding:       '10px 24px',
              fontFamily:    'var(--font-body)',
              fontSize:      '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor:        'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Layout */}
      {!error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '48px' }}>
          <FilterSidebar categories={categories} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading
              ? <ProductsSkeleton />
              : <ProductsGrid products={products} totalCount={products.length} />
            }
          </div>
        </div>
      )}

      <FilterBottomSheet
        categories={categories}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <style>{`
        @media (max-width: 1023px) {
          .filter-trigger { display: inline-flex !important; }
        }
      `}</style>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}
