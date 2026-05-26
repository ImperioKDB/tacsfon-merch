'use client'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

interface ProductViewerProps {
  imageUrl: string | null;
  productName: string;
}

export default function ProductViewer({ imageUrl, productName }: ProductViewerProps) {
  const fullImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-assets/${imageUrl}`)
    : null;

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {fullImageUrl ? (
          <Image 
            src={fullImageUrl} 
            alt={productName} 
            fill 
            className="object-cover" 
            priority 
            unoptimized={true}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-zinc-700 bg-zinc-950">
            <ShoppingBag size={64} strokeWidth={1} />
            <p className="text-xs mt-4 uppercase font-bold tracking-widest">Image Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
