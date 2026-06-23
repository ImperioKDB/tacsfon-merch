'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import HomeProductCard from './ProductCard'
import type { Product } from '@/types'
import { PackageOpen, ArrowRight } from 'lucide-react'

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <section
        style={{
          padding: '96px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          gap: '16px',
        }}
      >
        <PackageOpen size={48} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          New Collection Loading
        </p>
      </section>
    )
  }

  const [hero, ...rest] = products

  return (
    <section
      aria-labelledby="featured-heading"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '40px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#3DBA6F',
              marginBottom: '8px',
            }}
          >
            Just Dropped
          </p>
          <h2
            id="featured-heading"
            className="section-title"
          >
            New Arrivals
          </h2>
        </div>

        <Link
          href="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3DBA6F',
            textDecoration: 'none',
            borderBottom: '1px solid #3DBA6F',
            paddingBottom: '2px',
            transition: 'color 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          View All <ArrowRight size={12} strokeWidth={2} />
        </Link>
      </motion.div>

      <div className="divider-gold" style={{ marginBottom: '40px' }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}
        className="featured-grid"
      >
        {hero && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="featured-hero"
            style={{ gridRow: 'span 1' }}
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
          >
            <HomeProductCard product={p} />
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .featured-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            grid-template-rows: auto auto;
          }
          .featured-hero {
            grid-column: span 2;
            grid-row: span 2;
          }
        }
      `}</style>
    </section>
  )
}
