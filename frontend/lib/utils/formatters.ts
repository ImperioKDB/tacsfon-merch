/**
 * Formats a number as Nigerian Naira.
 * e.g. 5000 → ₦5,000
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Returns the effective price for a variant.
 * Uses price_override if set, falls back to base_price.
 */
export function getVariantPrice(basePrice: number, priceOverride: number | null): number {
  return priceOverride ?? basePrice
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

/** Short order ID for display: first 8 chars uppercased, prefixed with # */
export function formatOrderId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`
}

/**
 * Builds the Supabase Storage public URL for a product image.
 * Matches the DB masterplan storage URL pattern.
 */
export function getProductImageUrl(productId: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/product-assets/images/${productId}/main.webp`
}

/**
 * Builds the Supabase Storage public URL for a product 3D model (.glb).
 */
export function getProductModelUrl(productId: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/product-assets/models/${productId}/model.glb`
}