/**
 * ProductsGrid (Client Component)
 *
 * - Fetches first page on mount based on searchParams
 * - Infinite scroll via IntersectionObserver
 * - Mobile: renders FilterBottomSheet trigger button
 * - Empty state and error state handled inline
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SlidersHorizontal, PackageX }               from 'lucide-react'
import { apiFetch }           from '@/lib/api/fetch'
import ProductCard            from './ProductCard'
import ProductsSkeleton       from './ProductsSkeleton'
import FilterBottomSheet      from './FilterBottomSheet'

interface Category { id: string; name: string }
interface SearchParams {
  category?:   string
  size?:       string
  stock_type?: string
  sort?:       string
}

const PAGE_SIZE = 12

export default function ProductsGrid({
  searchParams,
  categories,
}: {
  searchParams: SearchParams
  categories:   Category[]
}) {
  const [products,    setProducts]    = useState<any[]>([])
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { category, size, stock_type, sort } = searchParams

  const buildPath = useCallback(
    (pageNum: number) => {
      const p = new URLSearchParams()
      p.set('page',  String(pageNum))
      p.set('limit', String(PAGE_SIZE))
      if (category)   p.set('category_id', category)
      if (size)        p.set('size',        size)
      if (stock_type)  p.set('stock_type',  stock_type)
      if (sort)        p.set('sort',         sort)
      return `/products?${p.toString()}`
    },
    [category, size, stock_type, sort]
  )

  // Reset + fetch page 1 whenever filters change
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    apiFetch<any>(buildPath(1))
      .then(data => {
        if (cancelled) return
        setProducts(data.products ?? [])
        setTotalPages(data.pagination?.totalPages ?? data.pagination?.total_pages ?? 1)
        setPage(1)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load products. Please try again.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [buildPath])

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || page >= totalPages || loading || loadingMore) return

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return
        const next = page + 1
        setLoadingMore(true)

        apiFetch<any>(buildPath(next))
          .then(data => {
            setProducts(prev => [...prev, ...(data.products ?? [])])
            setPage(next)
            setTotalPages(data.pagination?.totalPages ?? data.pagination?.total_pages ?? 1)
          })
          .catch(() => {})
          .finally(() => setLoadingMore(false))
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [page, totalPages, loading, loadingMore, buildPath])

  const activeCount = [category, size, stock_type].filter(Boolean).length

  return (
    <>
      {/* Mobile filter bar */}
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{
            background: activeCount ? 'var(--color-gold)'  : 'var(--color-surface-2)',
            color:      activeCount ? '#0A0A0F'            : 'var(--color-text-primary)',
            border:     `1px solid ${activeCount ? 'var(--color-gold)' : 'var(--color-border)'}`,
            minHeight:  '44px',
          }}
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      {/* Desktop result count */}
      {!loading && (
        <p className="mb-5 hidden text-sm lg:block" style={{ color: 'var(--color-text-secondary)' }}>
          {products.length} item{products.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <ProductsSkeleton />
      ) : error ? (
        <EmptyState
          icon={<PackageX size={40} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)' }} />}
          title="Something went wrong"
          body={error}
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<PackageX size={40} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)' }} />}
          title="No products found"
          body="Try adjusting your filters."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more */}
      {loadingMore && (
        <div className="mt-4">
          <ProductsSkeleton count={3} />
        </div>
      )}

      {/* End of results */}
      {!loading && !loadingMore && page >= totalPages && products.length > 0 && (
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-disabled)' }}>
          You&apos;ve seen it all ❖
        </p>
      )}

      {/* Mobile bottom sheet */}
      <FilterBottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        activeCategory={category    ?? ''}
        activeSize={size            ?? ''}
        activeStockType={stock_type ?? ''}
        activeSort={sort            ?? 'newest'}
      />
    </>
  )
}

function EmptyState({
  icon, title, body, action,
}: {
  icon:    React.ReactNode
  title:   string
  body:    string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
      style={{ border: '1px dashed var(--color-border)' }}
    >
      {icon}
      <p className="mt-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{body}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold"
          style={{ background: 'var(--color-gold)', color: '#0A0A0F', minHeight: '44px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
