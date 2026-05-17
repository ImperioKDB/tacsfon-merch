import { POSTGRES_ERROR_MAP } from './errorCodes.js'

/**
 * Custom error class for API-level errors.
 * Throw this anywhere in your route handlers when you want to return
 * a specific error code and HTTP status.
 *
 * Example:
 *   throw new ApiError('CART_EMPTY', 'Your cart has no items.', 400)
 */
export class ApiError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.isApiError = true
    this.apiCode = code
    this.status = status
  }
}

/**
 * Central error handler. Called by withMiddleware when any route throws.
 * - Maps Postgres/PostgREST error codes to clean API error codes
 * - Logs full error details internally (never exposes stack traces to client)
 * - Returns the standard { success: false, error: { code, message } } envelope
 */
export function handleError(err, req, res) {
  const requestId = req.requestId || 'unknown'
  const isDev = process.env.NODE_ENV === 'development'

  // Internal structured log — never sent to client
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    requestId,
    userId: req.user?.id || null,
    path: req.url,
    method: req.method,
    message: err.message || 'Unknown error',
    pgCode: err.code || null,
    // Only include stack in development to avoid leaking internals
    ...(isDev && { stack: err.stack }),
  }))

  // 1. Handle custom ApiError (thrown intentionally in route handlers)
  if (err.isApiError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.apiCode, message: err.message },
    })
  }

  // 2. Handle Postgres error codes (from Supabase client)
  if (err.code && POSTGRES_ERROR_MAP[err.code]) {
    const mapped = POSTGRES_ERROR_MAP[err.code]
    return res.status(mapped.status).json({
      success: false,
      error: { code: mapped.code, message: mapped.message },
    })
  }

  // 3. Handle PostgREST error codes (nested inside Supabase query errors)
  if (err.details || err.hint) {
    const pgrstCode = err.code || ''
    if (POSTGRES_ERROR_MAP[pgrstCode]) {
      const mapped = POSTGRES_ERROR_MAP[pgrstCode]
      return res.status(mapped.status).json({
        success: false,
        error: { code: mapped.code, message: mapped.message },
      })
    }
  }

  // 4. Fallback: unexpected internal error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  })
}
