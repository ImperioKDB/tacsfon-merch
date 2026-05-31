
export function formatPrice(amount: number): string {
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

export const formatCurrency = formatPrice;

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function formatOrderId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

// NEW HELPER: Ensures images always have a valid full URL
export function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  return `${supabaseUrl}/storage/v1/object/public/product-assets/${path}`;
}
