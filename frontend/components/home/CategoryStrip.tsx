'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Category } from '@/types'

interface CategoryStripProps {
  categories: Category[]
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
  const searchParams   = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'all'

  if (!categories.length) return null

  const all = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <section aria-label="Shop by category">
      <div className="bg-bg-surface border-b border-border shadow-sm sticky top-[64px] z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-8 overflow-x-auto no-scrollbar py-1">
            {all.map((cat) => {
              const isActive = cat.id === activeCategory
              const href = cat.id === 'all' ? '/products' : `/products?category=${cat.id}`

              return (
                <Link
                  key={cat.id}
                  href={href}
                  className={`inline-flex items-center whitespace-nowrap px-4 py-4 font-body text-xs sm:text-sm font-medium tracking-wide transition-colors uppercase select-none ${
                    isActive
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-muted border-b-2 border-transparent hover:text-text-primary'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
