/**
 * /products — Product Catalogue Page (Server Component)
 *
 * - Fetches categories server-side for the sidebar
 * - Passes searchParams (category, size, stock_type, sort) to client grid
 * - URL state drives all filter logic
 */
import type { Metadata }    from 'next'
import { Suspense }         from 'react'
import ProductsGrid         from '@/components/products/ProductsGrid'
import FilterSidebar        from '@/components/products/FilterSidebar'
import ProductsSkeleton     from '@/components/products/ProductsSkeleton'

export const metadata: Metadata = {
  title:       'Products — TACSFON Merch',
  description: 'Browse the full TACSFON merch collection. Filter by category, size, and availability.',
}

interface ProductsPageProps {
  searchParams: {
    category?:   string
    size?:       string
    stock_type?: string
    sort?:       string
  }
}

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/categories`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.data?.categories ?? []
  } catch {
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const categories = await getCategories()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* ── Page Header ── */}
      <div
        className="border-b px-4 py-8 md:px-8"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto max-w-7xl">
          <h1
            className="text-4xl font-bold"
            style={{
              color:      'var(--color-text-primary)',
              fontFamily: 'var(--font-urbanist)',
            }}
          >
            The Collection
          </h1>
          <p
            className="mt-2 text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Premium TACSFON merch — wear the mission.
          </p>
        </div>
      </div>

      {/* ── Body: Sidebar + Grid ── */}
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 md:px-8">

        {/* Desktop Filter Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FilterSidebar
            categories={categories}
            activeCategory={searchParams.category    ?? ''}
            activeSize={searchParams.size            ?? ''}
            activeStockType={searchParams.stock_type ?? ''}
            activeSort={searchParams.sort            ?? 'newest'}
          />
        </aside>

        {/* Product Grid */}
        <main className="min-w-0 flex-1">
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsGrid searchParams={searchParams} categories={categories} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
