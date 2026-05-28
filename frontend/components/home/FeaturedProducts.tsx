'use client'
import Link from 'next/link'
import ProductCard from './ProductCard'
import type { Product } from '@/types'
import { PackageOpen } from 'lucide-react'

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-zinc-800 border-y border-zinc-900">
         <PackageOpen size={64} strokeWidth={1}/>
         <p className="mt-4 font-black uppercase tracking-[0.3em] text-xs">New Collection Loading...</p>
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">New Arrivals</h2>
        <Link href="/products" className="text-gold font-bold text-xs uppercase tracking-widest border-b border-gold pb-1">View All</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
