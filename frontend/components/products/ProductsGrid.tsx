'use client'

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

interface Variant {
  id: string; size: string; color: string
  stock_qty: number; price_override: number | null
}
interface Product {
  id: string; name: string; base_price: number
  image_url: string | null; stock_type: 'stock' | 'preorder' | 'both'
  is_available: boolean; product_variants?: Variant[]
}
interface Props {
  products:    Product[]
  totalCount?: number
}

export default function ProductsGrid({ products, totalCount }: Props) {
  if (!products.length) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        style={{
          padding:        '96px 0',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
        }}
      >
        <p style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '28px',
          letterSpacing: '0.04em',
          color:         'var(--text-muted)',
        }}>
          NO PRODUCTS FOUND
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
          Try adjusting your filters
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      {totalCount !== undefined && (
        <p style={{
          fontFamily:    'var(--font-body)',
          fontSize:      '12px',
          letterSpacing: '0.08em',
          color:         'var(--text-muted)',
          marginBottom:  '20px',
          textTransform: 'uppercase',
        }}>
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </p>
      )}

      <div
        className="products-grid"
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap:                 '1px',
          background:          'var(--border)',
        }}
      >
        {products.map((p, idx) => (
          <motion.div 
            key={p.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            style={{ background: 'var(--bg-base)' }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
        {products.length % 2 !== 0 && (
          <div style={{ background: 'var(--bg-base)' }} aria-hidden="true" />
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .products-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
