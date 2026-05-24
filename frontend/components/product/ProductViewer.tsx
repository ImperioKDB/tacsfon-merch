'use client'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

interface ProductViewerProps {
  imageUrl: string | null;
  productName: string;
  modelUrl?: string | null;
  categoryName?: string | null;
}

export default function ProductViewer({ imageUrl, productName }: ProductViewerProps) {
  // Construct the full Supabase URL for the image
  const fullImageUrl = imageUrl 
    ? (imageUrl.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-assets/${imageUrl}`)
    : null;

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square overflow-hidden bg-surface border border-border rounded-2xl">
        {fullImageUrl ? (
          <Image 
            src={fullImageUrl} 
            alt={productName} 
            fill 
            className="object-cover" 
            priority 
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, 500px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-text-disabled bg-surface-2">
            <ShoppingBag size={64} strokeWidth={1} />
            <p className="text-sm mt-4">Image coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
