'use client'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, resolveImageUrl } from '@/lib/utils/formatters'
import Badge from '@/components/ui/Badge'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const variants = product.variants || [];
  const displayPrice = variants.length > 0 
    ? formatPrice(variants[0].price_override ?? product.base_price)
    : formatPrice(product.base_price);

  const img = resolveImageUrl(product.image_url);

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square bg-[#13131A] border border-[#2A2A38] overflow-hidden mb-4">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-zinc-800">No Image</div>
        )}
      </div>
      <h3 className="text-[#F7F5F0] font-bold text-lg leading-tight mb-1">{product.name}</h3>
      <p className="text-[#C9A84C] font-bold font-mono">{displayPrice}</p>
    </Link>
  );
}
