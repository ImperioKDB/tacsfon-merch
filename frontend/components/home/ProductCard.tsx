'use client'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/formatters'
import Badge from '@/components/ui/Badge'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const variants = product.variants || [];
  
  // Safe Price Logic: Use variant prices if they exist, otherwise fallback to base_price
  const getDisplayPrice = () => {
    if (!variants.length || variants.length === 0) return formatPrice(product.base_price);
    const prices = variants.map(v => v.price_override ?? product.base_price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min) : `From ${formatPrice(min)}`;
  };

  const hasStock = variants.some(v => v.stock_qty > 0) || (product as any).stock_qty > 0;

  return (
    <Link href={`/products/${product.id}`} className="group block space-y-4">
      <div className="relative aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-zinc-800">No Image</div>
        )}
        {!hasStock && (
            <div className="absolute top-4 left-4"><Badge variant="error">Out of Stock</Badge></div>
        )}
      </div>
      <div>
        <h3 className="text-white font-bold text-lg leading-tight mb-1">{product.name}</h3>
        <p className="text-gold font-bold font-mono">{getDisplayPrice()}</p>
      </div>
    </Link>
  );
}
