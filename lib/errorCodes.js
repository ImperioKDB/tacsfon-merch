/**
 * Maps Postgres / PostgREST error codes to API error codes and HTTP statuses.
 * The error handler uses this to translate raw DB errors into clean API responses.
 */
export const POSTGRES_ERROR_MAP = {
  // Unique constraint violation (e.g. duplicate email, duplicate cart item)
  '23505': {
    code: 'DUPLICATE_ENTRY',
    status: 409,
    message: 'A record with this value already exists.',
  },
  // Foreign key violation (e.g. invalid category_id, product_id)
  '23503': {
    code: 'INVALID_REFERENCE',
    status: 400,
    message: 'One or more referenced records do not exist.',
  },
  // Check constraint violation (bad enum value, negative price, zero quantity)
  '23514': {
    code: 'INVALID_VALUE',
    status: 400,
    message: 'A value failed a database constraint check.',
  },
  // Insufficient privilege (RLS blocked the operation)
  '42501': {
    code: 'FORBIDDEN',
    status: 403,
    message: 'You do not have permission to perform this action.',
  },
  // PostgREST: row not found (single-row queries)
  'PGRST116': {
    code: 'NOT_FOUND',
    status: 404,
    message: 'The requested record was not found.',
  },
}

/**
 * Standard application-level error codes.
 * These are returned as the `code` field in { success: false, error: { code, message } }.
 */
export const ERROR = {
  UNAUTHORIZED:        { code: 'UNAUTHORIZED',        status: 401 },
  FORBIDDEN:           { code: 'FORBIDDEN',           status: 403 },
  NOT_FOUND:           { code: 'NOT_FOUND',           status: 404 },
  VALIDATION_ERROR:    { code: 'VALIDATION_ERROR',    status: 400 },
  INTERNAL_ERROR:      { code: 'INTERNAL_ERROR',      status: 500 },
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429 },
  INVALID_ID:          { code: 'INVALID_ID',          status: 400 },
  METHOD_NOT_ALLOWED:  { code: 'METHOD_NOT_ALLOWED',  status: 405 },
  // Cart errors (Phase 4)
  CART_EMPTY:          { code: 'CART_EMPTY',          status: 400 },
  CART_ITEM_NOT_FOUND: { code: 'CART_ITEM_NOT_FOUND', status: 404 },
  INSUFFICIENT_STOCK:  { code: 'INSUFFICIENT_STOCK',  status: 400 },
  PRODUCT_UNAVAILABLE: { code: 'PRODUCT_UNAVAILABLE', status: 400 },
  // Order errors (Phase 5)
  ORDER_NOT_FOUND:        { code: 'ORDER_NOT_FOUND',        status: 404 },
  INVALID_STATUS_CHANGE:  { code: 'INVALID_STATUS_CHANGE',  status: 400 },
}
