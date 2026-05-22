'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ShoppingBag, Box, ImageIcon } from 'lucide-react'
import { useSelectedProductStore } from '@/store/selected-product'

const ProceduralMerchViewer = dynamic(() => import('@/components/3d/ProceduralMerchViewer'), { ssr: false })

export default function ProductViewer({ imageUrl, modelUrl, productName, categoryName }) {
  const hasImage = Boolean(imageUrl)
  const [activeTab, setActiveTab] = useState('3d')
  const [threeError, setThreeError] = useState(false)
  const variantColor = useSelectedProductStore(s => s.variantColor)

  useEffect(() => { if (threeError && hasImage) setActiveTab('image') }, [threeError, hasImage])

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square overflow-hidden bg-surface border border-border">
        {activeTab === '3d' && !threeError ? (
          <div className="absolute inset-0">
             <ProceduralMerchViewer category={categoryName} colorName={variantColor} onError={() => setThreeError(true)} />
          </div>
        ) : (
          <div className="relative h-full w-full">
            {hasImage ? <Image src={imageUrl} alt={productName} fill className="object-cover" priority /> : <div className="flex h-full w-full items-center justify-center text-text-disabled"><ShoppingBag size={48} /></div>}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('3d')} disabled={threeError} className={`px-4 py-2 text-xs font-bold border ${activeTab === '3d' ? 'bg-gold text-bg border-gold' : 'bg-surface text-text-secondary border-border'}`}>3D VIEW</button>
        {hasImage && <button onClick={() => setActiveTab('image')} className={`px-4 py-2 text-xs font-bold border ${activeTab === 'image' ? 'bg-gold text-bg border-gold' : 'bg-surface text-text-secondary border-border'}`}>IMAGE</button>}
      </div>
    </div>
  )
}