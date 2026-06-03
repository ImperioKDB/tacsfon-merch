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
    <Link href={`/orders/${order.id}`} className="group block bg-[#0D0D0D] border border-white/5 hover:border-[#C9A84C]/20 transition-all duration-500">
      <div className="flex items-center p-3 gap-4">
        <div className="relative w-14 h-18 bg-[#151515] overflow-hidden shrink-0 border border-white/5">
          {img && (
            <Image 
              src={img} 
              alt="merch" 
              fill 
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              unoptimized 
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-zinc-600 tracking-tighter">#{shortId}</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#C9A84C] bg-[#C9A84C]/5 px-1.5 py-0.5 border border-[#C9A84C]/10">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="font-display text-base text-[#F5F0E8] leading-tight uppercase truncate tracking-wide">
            {firstItem?.variant?.product?.name || 'TACSFON ITEM'}
            {order.items && order.items.length > 1 && <span className="text-zinc-500 ml-1">+{order.items.length - 1}</span>}
          </p>
        </div>

        <div className="text-right shrink-0 pr-2">
          <p className="font-body text-xs font-bold text-[#F5F0E8]">₦{order.total.toLocaleString()}</p>
          <ChevronRight size={12} className="text-zinc-800 ml-auto mt-1 group-hover:text-[#C9A84C] transition-colors" />
        </div>
      </div>
    </Link>
  )
}