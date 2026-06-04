'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { resolveImageUrl } from '@/lib/utils/formatters'
import type { Order } from '@/types'

export default function OrderCard({ order }: { order: Order }) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const firstItem = order.items?.[0]
  const img = resolveImageUrl(firstItem?.variant?.product?.image_url)

  return (
    <Link href={`/orders/${order.id}`} className="group block bg-[#080808] border border-white/5 hover:border-[#3DBA6F]/20 transition-all duration-700">
      <div className="flex items-center p-3 gap-5">
        <div className="relative w-12 h-16 bg-[#111] overflow-hidden shrink-0 border border-white/5">
          {img && <Image src={img} alt="item" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" unoptimized />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[9px] text-zinc-700">#{shortId}</span>
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#3DBA6F] border border-[#3DBA6F]/20 px-1">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="font-display text-sm text-[#F5F0E8] leading-none uppercase tracking-wide truncate">
            {firstItem?.variant?.product?.name || 'TACSFON_ITEM'}
          </p>
        </div>
        <div className="text-right shrink-0 pr-2">
          <p className="font-body text-[11px] font-black text-[#F5F0E8]">₦{order.total.toLocaleString()}</p>
          <ChevronRight size={10} className="text-zinc-800 ml-auto mt-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}