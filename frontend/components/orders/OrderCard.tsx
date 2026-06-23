'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { resolveImageUrl } from '@/lib/utils/formatters'
import type { Order } from '@/types'

export default function OrderCard({ order }: { order: Order }) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const firstItem = order.items?.[0] || (order as any).order_items?.[0]
  const img = resolveImageUrl(firstItem?.variant?.product?.image_url || firstItem?.product_variant?.product?.image_url)
  const name = firstItem?.variant?.product?.name || firstItem?.product_variant?.product?.name || 'TACSFON ITEM'

  return (
    <Link 
      href={`/orders/${order.id}`} 
      style={{
        display: 'block', background: '#080808', border: '1px solid rgba(255,255,255,0.05)',
        textDecoration: 'none', transition: 'all 300ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(61,186,111,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '20px' }}>
        <div style={{ position: 'relative', width: '48px', height: '64px', background: '#111111', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
          {img && <Image src={img} alt="item" fill style={{ objectFit: 'cover' }} unoptimized />}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
              #{shortId}
            </span>
            <span style={{
              fontSize: '7px', fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.3em', color: 'var(--accent)', border: '1px solid rgba(61,186,111,0.2)', padding: '2px 4px',
            }}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '14px', color: '#F5F0E8', lineHeight: 1,
            textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {name}
          </p>
        </div>
        
        <div style={{ textAlign: 'right', flexShrink: 0, paddingRight: '8px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 900, color: '#F5F0E8', margin: 0 }}>
            ₦{order.total?.toLocaleString() ?? '0'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
