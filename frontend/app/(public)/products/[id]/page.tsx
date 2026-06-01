import { notFound } from 'next/navigation';
import ProductViewer from '@/components/product/ProductViewer';
import ProductInfo from '@/components/product/ProductInfo';

async function getProduct(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-black pt-20 pb-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* MEDIA SECTION */}
        <ProductViewer imageUrl={product.image_url} productName={product.name} />

        {/* CONTENT SECTION */}
        <ProductInfo product={product} />
      </div>
    </div>
  );
}
