import type { ApiError } from '@/lib/api/fetch'

/**
 * Maps backend error codes (from the API contract) to user-facing messages.
 * Keep in sync with the backend masterplan error code list.
 */
const ERROR_MESSAGES: Record<string, string> = {
  CART_EMPTY: 'Your cart is empty. Add some items first.',
  INSUFFICIENT_STOCK: 'Sorry, not enough stock for your requested quantity.',
  PRODUCT_UNAVAILABLE: 'This product is no longer available.',
  FILE_TOO_LARGE: 'File is too large. Please upload a file under 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a JPG, PNG, or PDF.',
  INVALID_STATUS_CHANGE: 'This action is not allowed at the current order stage.',
  NETWORK_ERROR: 'Connection issue. Please check your internet and try again.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again or contact support.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  INVALID_REFERENCE: 'Invalid selection. Please check your input.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  CART_ITEM_NOT_FOUND: 'Cart item not found.',
  NOT_FOUND: 'The requested item could not be found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
}

export function getErrorMessage(
  error: ApiError | { code?: string; message?: string }
): string {
  const code: string = error.code ?? 'UNKNOWN_ERROR'

  return (
    ERROR_MESSAGES[code] ??
    error.message ??
    ERROR_MESSAGES.UNKNOWN_ERROR
  )
}