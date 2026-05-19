'use client'

/**
 * Routes to the correct procedural viewer based on product category name.
 * All viewers are lazy-loaded — never in the initial bundle.
 *
 * Category → viewer mapping is intentionally fuzzy (lowercase includes check)
 * so that category names like "Pullover Hoodies" or "Snapback Caps" still match.
 */

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { resolveColor } from '@/lib/utils/merch-colors'

interface ViewerProps {
  color?:   string
  onError?: () => void
}

type MerchType = 'tshirt' | 'hoodie' | 'cap' | 'totebag' | 'beanie' | 'tie'

const VIEWERS: Record<MerchType, ComponentType<ViewerProps>> = {
  tshirt:  dynamic(() => import('./viewers/TShirtViewer3D'),   { ssr: false, loading: () => <Skeleton /> }),
  hoodie:  dynamic(() => import('./viewers/HoodieViewer3D'),   { ssr: false, loading: () => <Skeleton /> }),
  cap:     dynamic(() => import('./viewers/CapViewer3D'),      { ssr: false, loading: () => <Skeleton /> }),
  totebag: dynamic(() => import('./viewers/ToteBagViewer3D'),  { ssr: false, loading: () => <Skeleton /> }),
  beanie:  dynamic(() => import('./viewers/BeanieViewer3D'),   { ssr: false, loading: () => <Skeleton /> }),
  tie:     dynamic(() => import('./viewers/TieViewer3D'),      { ssr: false, loading: () => <Skeleton /> }),
}

function getMerchType(category?: string | null): MerchType {
  const name = (category ?? '').toLowerCase()
  if (name.includes('hoodie') || name.includes('sweat') || name.includes('pullover')) return 'hoodie'
  if (name.includes('cap') || name.includes('hat') || name.includes('snapback') || name.includes('fitted')) return 'cap'
  if (name.includes('bag') || name.includes('tote')) return 'totebag'
  if (name.includes('beanie') || name.includes('beamer') || name.includes('winter hat')) return 'beanie'
  if (name.includes('tie') && !name.includes('tote')) return 'tie'
  return 'tshirt'   // default — covers "T-Shirts", "Shirts", unknown
}

function Skeleton() {
  return <div className="w-full h-full bg-surface animate-pulse rounded-2xl" />
}

interface Props {
  category?:  string | null   // from product.categories.name
  colorName?: string | null   // from selected variant colour name
  onError?:   () => void
}

export default function ProceduralMerchViewer({ category, colorName, onError }: Props) {
  const type   = getMerchType(category)
  const color  = resolveColor(colorName)
  const Viewer = VIEWERS[type]
  return <Viewer color={color} onError={onError} />
}