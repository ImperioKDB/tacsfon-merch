/**
 * lib/utils/formatters.ts
 * Display formatters used across admin and student UIs.
 */

/**
 * Format a number as Nigerian Naira.
 * e.g. formatPrice(5000) → "₦5,000"
 */
export function formatPrice(amount: number): string {
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

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
 * Alias for formatPrice.
 * ReceiptPreview.tsx imports this name — keeping it as an alias
 * avoids touching the receipt component.
 */
export const formatCurrency = formatPrice
