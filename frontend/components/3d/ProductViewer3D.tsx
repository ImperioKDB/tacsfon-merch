'use client'

/**
 * Top-level 3D viewer for the product detail page.
 *
 * Strategy (cost-free, tier-free):
 *   1. If product.model_url is set → attempt to load the GLB from /public/models/
 *   2. On GLB load error OR no model_url → render ProceduralMerchViewer (zero assets)
 *
 * Both paths render in the same container so the parent layout never shifts.
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ProceduralMerchViewer from './ProceduralMerchViewer'

const GLBViewer = dynamic(() => import('./GLBViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface animate-pulse rounded-2xl" />,
})

interface Props {
  modelUrl?:  string | null
  category?:  string | null
  colorName?: string | null
  onError?:   () => void
}

export default function ProductViewer3D({ modelUrl, category, colorName, onError }: Props) {
  const [glbFailed, setGlbFailed] = useState(false)

  const useGlb = !!modelUrl && !glbFailed

  if (useGlb) {
    return (
      <GLBViewer
        modelUrl={modelUrl!}
        onError={() => { setGlbFailed(true); onError?.() }}
      />
    )
  }

  return (
    <ProceduralMerchViewer
      category={category}
      colorName={colorName}
      onError={onError}
    />
  )
}