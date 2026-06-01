/**
 * lib/utils/formatters.ts
 * Comprehensive display formatters used across admin and student UIs.
 */

export function formatPrice(amount: number): string {
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

export const formatCurrency = formatPrice;

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

// FIX: Restoring this function so the Audit Logs page can build successfully
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

export function formatOrderId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export function getVariantPrice(
  base_price:     number,
  price_override: number | null | undefined,
): number {
  return price_override ?? base_price
}

export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  return base ? `${base}/storage/v1/object/public/product-assets/${path}` : null;
}
