'use client'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

interface ProductViewerProps {
  imageUrl: string | null;
  productName: string;
  // We keep these in the interface to satisfy the parent page,
  // even though we are now in stable 2D mode.
  modelUrl?: string | null;
  categoryName?: string | null;
}

export default function ProductViewer({ imageUrl, productName }: ProductViewerProps) {
  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square overflow-hidden bg-surface border border-border rounded-2xl">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={productName} 
            fill 
            className="object-cover" 
            priority 
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
