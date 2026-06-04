'use client'
import Image from 'next/image'
import { resolveImageUrl } from '@/lib/utils/formatters'

export default function ProductViewer({ imageUrl, productName }: { imageUrl: string | null, productName: string }) {
  const img = resolveImageUrl(imageUrl)
  return (
    <div className="relative aspect-[3/4] bg-[#0D0D0D] border border-white/5 overflow-hidden">
      {img ? (
        <Image src={img} alt={productName} fill className="object-cover" unoptimized />
      ) : (
        <div className="h-full flex items-center justify-center text-[10px] uppercase text-zinc-800">No_Media</div>
      )}
    </div>
  )
}