'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams }               from 'next/navigation'
import dynamic_import                    from 'next/dynamic'
import { SlidersHorizontal }             from 'lucide-react'
import ProductsGrid                      from '@/components/products/ProductsGrid'
import ProductsSkeleton                  from '@/components/products/ProductsSkeleton'

const FilterSidebar = dynamic_import(
  () => import('@/components/products/FilterSidebar'),
  { ssr: false }
)
const FilterBottomSheet = dynamic_import(
  () => import('@/components/products/FilterBottomSheet'),
  { ssr: false }
)

interface Variant {
  id: string; size: string; color: string
  stock_qty: number; price_override: number | null
}
interface Product {
  id: string; name: string; base_price: number
  image_url: string | null; stock_type: 'stock' | 'preorder' | 'both'
  is_available: boolean; product_variants?: Variant[]
}
interface Category { id: string; name: string }

function ProductsContent() {
  const params = useSearchParams()
  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [sheetOpen,  setSheetOpen]  = useState(false)

  useEffect(() => {
    // Build query params for filtering
    const query = new URLSearchParams()
    if (params.get('category')) query.set('category_id', params.get('category')!)
    if (params.get('sort'))     query.set('sort',        params.get('sort')!)
    if (params.get('stock'))    query.set('stock_type',  params.get('stock')!)
    const qs = query.toString()

    setLoading(true)
    setError(null)

    // Call our same-domain Next.js proxy routes — no CORS
    Promise.all([
      fetch(`/api/proxy/products${qs ? `?${qs}` : ''}`).then(r => r.json()),
      fetch('/api/proxy/categories').then(r => r.json()),
    ])
      .then(([pRes, cRes]) => {
        const prods = Array.isArray(pRes) ? pRes : (pRes?.data ?? [])
        const cats  = Array.isArray(cRes) ? cRes : (cRes?.data ?? [])
        setProducts(prods)
        setCategories(cats)
      })
      .catch(err => {
        console.error('[ProductsPage]', err)
        setError('Failed to load products. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [params])

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 16px 120px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '6px',
        }}>
          TACSFON Merch
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1, letterSpacing: '0.04em', color: 'var(--text-primary)', margin: 0,
          }}>
            ALL PRODUCTS
          </h1>
          <button onClick={() => setSheetOpen(true)} className="filter-trigger"
            aria-label="Open filters" style={{
              display: 'none', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-primary)', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', padding: '10px 16px',
              cursor: 'pointer', minHeight: '44px', whiteSpace: 'nowrap',
            }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--accent)' }} />
            Filter
          </button>
        </div>
        <div aria-hidden="true" style={{
          height: '1px',
          background: 'linear-gradient(90deg, var(--accent), transparent)',
          marginTop: '14px', maxWidth: '200px',
        }} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--danger)' }}>
          <p style={{ marginBottom: '16px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
            padding: '10px 24px', fontFamily: 'var(--font-body)', fontSize: '12px',
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            Try Again
          </button>
        </div>
      )}

      {/* Layout */}
      {!error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px' }}>
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
