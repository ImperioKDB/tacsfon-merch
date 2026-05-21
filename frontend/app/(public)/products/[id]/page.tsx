/**
 * /products/[id] — Product Detail Page (Server Component)
 *
 * Fetches a single product with its full variant list via the backend API.
 * Passes the data to client components for 3D viewer and cart interactions.
 */
import type { Metadata }    from 'next'
import { notFound }         from 'next/navigation'
import Link                 from 'next/link'
import { ChevronRight }     from 'lucide-react'
import type { Product }     from '@/types'
import ProductViewer        from '@/components/product/ProductViewer'
import ProductInfo          from '@/components/product/ProductInfo'

interface Props {
  params: { id: string }
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/products/${id}`,
      { next: { revalidate: 30 } }
    )
    if (res.status === 404) return null
    if (!res.ok)            return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id)
  if (!product) return { title: 'Product Not Found — TACSFON Merch' }
  return {
    title:       `${product.name} — TACSFON Merch`,
    description: product.description ?? `Shop ${product.name} from TACSFON Merch.`,
    openGraph: {
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/products"
            className="transition-colors hover:underline"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Products
          </Link>
          <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)' }} />
          {product.category && (
            <>
              <Link
                href={`/products?category=${product.category.id}`}
                className="transition-colors hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {product.category.name}
              </Link>
              <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)' }} />
            </>
          )}
          <span style={{ color: 'var(--color-text-primary)' }}>{product.name}</span>
        </nav>

        {/* Two-column layout */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          {/* Left — Media panel */}
          <div className="w-full lg:w-[480px] lg:flex-shrink-0">
            <ProductViewer
              imageUrl={product.image_url}
              modelUrl={product.model_url}
              productName={product.name}
              categoryName={product.category?.name ?? null}
            />
          </div>

          {/* Right — Product info */}
          <div className="flex-1">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}