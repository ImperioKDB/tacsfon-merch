import { ApiError } from './errorHandler.js'

// UUID v4 regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validates that a string is a valid UUID v4.
 * Throws ApiError(INVALID_ID, 400) if not valid.
 * Use for all route params before passing to the database.
 *
 * Example:
 *   const { id } = req.query
 *   validateUUID(id, 'order')
 */
export function validateUUID(value, fieldName = 'id') {
  if (!value || !UUID_REGEX.test(value)) {
    throw new ApiError(
      'INVALID_ID',
      `'${fieldName}' must be a valid UUID.`,
      400
    )
  }
  return value
}

/**
 * Asserts that a method is one of the allowed methods.
 * Throws ApiError(METHOD_NOT_ALLOWED, 405) otherwise.
 *
 * Example:
 *   assertMethod(req, ['GET', 'POST'])
 */
export function assertMethod(req, allowed) {
  if (!allowed.includes(req.method)) {
    throw new ApiError(
      'METHOD_NOT_ALLOWED',
      `Method ${req.method} is not allowed on this endpoint.`,
      405
    )
  }
}
