/**
 * lib/middleware/validate.js
 *
 * Zod-based request validation helpers.
 *
 * Usage inside a route handler:
 *   import { validateBody } from '../../../lib/middleware/validate.js'
 *   import { PlaceOrderSchema } from '../../../lib/schemas/orderSchemas.js'
 *
 *   const body = validateBody(req, PlaceOrderSchema)
 *   // body is the parsed, validated, and typed object
 *   // throws ApiError(VALIDATION_ERROR, 400) with field details if invalid
 */
import { ApiError } from '../errorHandler.js'

/**
 * Validates and parses req.body against a Zod schema.
 * Throws ApiError with field-level error details on failure.
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('zod').ZodSchema} schema
 * @returns {object} parsed and validated body
 */
export function validateBody(req, schema) {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const fields = result.error.errors.map(e => ({
      field:   e.path.join('.'),
      message: e.message,
    }))

    throw new ApiError(
      'VALIDATION_ERROR',
      `Validation failed: ${fields.map(f => f.message).join(', ')}`,
      400
    )
  }

  return result.data
}

/**
 * Validates req.query against a Zod schema.
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('zod').ZodSchema} schema
 * @returns {object} parsed and validated query params
 */
export function validateQuery(req, schema) {
  const result = schema.safeParse(req.query)

  if (!result.success) {
    const fields = result.error.errors.map(e => ({
      field:   e.path.join('.'),
      message: e.message,
    }))

    throw new ApiError(
      'VALIDATION_ERROR',
      `Invalid query params: ${fields.map(f => f.message).join(', ')}`,
      400
    )
  }

  return result.data
}
