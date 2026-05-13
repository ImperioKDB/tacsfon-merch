/**
 * Standard response envelope used by every route.
 *
 * Success shape:  { success: true, data: {...}, message: "..." }
 * Error shape:    { success: false, error: { code, message, field? } }
 *
 * Frontend should never need to parse raw Supabase errors.
 * All errors are mapped here before reaching the client.
 */

/**
 * Send a success response.
 * @param {object} res        - Next.js response object
 * @param {any}    data       - Payload to include under `data`
 * @param {string} message    - Optional human-readable message
 * @param {number} statusCode - HTTP status (default 200)
 */
export function sendSuccess(res, data = null, message = null, statusCode = 200) {
  const body = { success: true }
  if (data !== null && data !== undefined) body.data = data
  if (message) body.message = message
  return res.status(statusCode).json(body)
}

/**
 * Send an error response.
 * @param {object} res        - Next.js response object
 * @param {string} code       - Machine-readable error code (e.g. 'CART_EMPTY')
 * @param {string} message    - Human-readable error message
 * @param {number} statusCode - HTTP status (default 400)
 * @param {string} field      - Optional: field that caused a validation error
 */
export function sendError(res, code, message, statusCode = 400, field = null) {
  const error = { code, message }
  if (field) error.field = field
  return res.status(statusCode).json({ success: false, error })
}
