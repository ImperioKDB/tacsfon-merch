import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import Hero from '@/components/home/Hero'
import CategoryStrip from '@/components/home/CategoryStrip'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BrandStatement from '@/components/home/BrandStatement'
import type { Category, Product } from '@/types'

export const metadata: Metadata = {
  title: 'TACSFON Merch',
  description: 'Premium merch for the TACSFON community. Shop T-shirts, hoodies, caps and more.',
}

export default async function HomePage() {
  const supabase = await createServerClient()

  // Fetch categories for the strip
  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('id, name, created_at')
    .order('name')

  // Fetch 4 newest available products with variants for featured grid
  const { data: productsRaw } = await supabase
    .from('products')
    .select(`
      id, name, description, base_price, image_url, model_url,
      is_available, stock_type, category_id, created_at, updated_at,
      variants:product_variants(id, size, color, stock_qty, price_override)
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const categories = (categoriesRaw ?? []) as Category[]
  const products   = (productsRaw   ?? []) as Product[]

  return (
    <>
      {/* id="hero" → Navbar IntersectionObserver watches this */}
      <Hero />
      <CategoryStrip categories={categories} />
      <FeaturedProducts products={products} />
      <BrandStatement />
    </>
  )
}