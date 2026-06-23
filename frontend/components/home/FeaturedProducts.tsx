'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import HomeProductCard from './ProductCard'
import type { Product } from '@/types'
import { PackageOpen, ArrowRight } from 'lucide-react'

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <section className="py-24 px-6 flex flex-col items-center justify-center gap-4 bg-bg-surface/50 border-y border-border">
        <PackageOpen size={48} strokeWidth={1} className="text-text-muted opacity-50" />
        <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
          New Collection Loading
        </p>
      </section>
    )
  }

  const [hero, ...rest] = products

  return (
    <section aria-labelledby="featured-heading" className="max-w-7xl mx-auto py-24 px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-12 flex-wrap gap-6"
      >
        <div>
          <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            Just Dropped
          </p>
          <h2 id="featured-heading" className="font-display text-4xl sm:text-5xl text-text-primary tracking-tight">
            New Arrivals
          </h2>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-body text-sm font-semibold tracking-wider uppercase text-bg-surface bg-text-primary px-6 py-3 rounded-full hover:bg-accent hover:text-white transition-all shadow-sm"
        >
          View All <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        {hero && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="sm:col-span-2 sm:row-span-2 h-full min-h-[400px]"
          >
            <HomeProductCard product={hero} priority />
          </motion.div>
        )}

        {rest.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="h-full min-h-[300px]"
          >
            <HomeProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
