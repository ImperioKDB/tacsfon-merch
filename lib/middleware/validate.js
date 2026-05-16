import { ApiError } from '../errorHandler.js'

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
