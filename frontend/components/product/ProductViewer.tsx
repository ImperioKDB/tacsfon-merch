'use client'
import Image from 'next/image'
import { resolveImageUrl } from '@/lib/utils/formatters'

export default function ProductViewer({ imageUrl, productName }: { imageUrl: string | null, productName: string }) {
  const img = resolveImageUrl(imageUrl)

  return (
    <div className="space-y-6">
      <div className="relative aspect-[3/4] bg-[#0D0D0D] border border-white/5 overflow-hidden group">
        {img ? (
          <Image 
            src={img} 
            alt={productName} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            unoptimized 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-zinc-800 uppercase tracking-widest">Media_Pending</div>
        )}
      </div>
      <div className="h-px w-24 bg-gradient-to-r from-[#3DBA6F] to-transparent" />
    </div>
  )
}