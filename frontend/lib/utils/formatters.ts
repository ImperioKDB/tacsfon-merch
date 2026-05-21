/**
 * lib/utils/formatters.ts
 * Display formatters used across admin and student UIs.
 */

import type { Product, ProductVariant } from '@/types'

/**
 * Format a number as Nigerian Naira.
 * e.g. formatPrice(5000) → "₦5,000"
 */
export function formatPrice(amount: number): string {
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

/**
 * Alias for formatPrice.
 * ReceiptPreview.tsx imports this name.
 */
export const formatCurrency = formatPrice

/**
 * Format an ISO date string to a short readable date.
 * e.g. "2024-05-21T10:30:00Z" → "21 May 2024"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Format an ISO date string to date + time.
 * e.g. "2024-05-21T10:30:00Z" → "21 May 2024, 10:30"
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/**
 * Truncate a UUID to the first 8 characters, prefixed with #.
 * e.g. formatOrderId("abc123def456") → "#ABC123DE"
 */
export function formatOrderId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

/**
 * Return the effective display price for a product.
 * Used by ProductCard for the "from ₦X,XXX" label.
 *
 * Logic:
 *   - If the product has variants with a price_override, return
 *     the lowest override so the card shows the cheapest entry point.
 *   - Otherwise return the product's base_price.
 *
 * e.g. getVariantPrice(product, variants) → 4500
 */
export function getVariantPrice(
  product:  Pick<Product, 'base_price'>,
  variants?: Pick<ProductVariant, 'price_override'>[] | null,
): number {
  if (variants && variants.length > 0) {
    const overrides = variants
      .map(v => v.price_override)
      .filter((p): p is number => typeof p === 'number')

    if (overrides.length > 0) {
      return Math.min(...overrides)
    }
  }
  return product.base_price
}
