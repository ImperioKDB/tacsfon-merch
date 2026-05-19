/**
 * Shared response-shape helpers for Next.js App Router route handlers.
 *
 * errorResponse() builds the standard error envelope used by every
 * API route in this project. Imported by:
 *   - lib/middleware/rateLimit.ts
 *   - lib/middleware/validate.ts
 *
 * Shape: { success: false, error: { code, message, field? } }
 */

export interface ApiErrorBody {
  success: false
  error: {
    code:     string
    message:  string
    field?:   string
  }
}

export interface ApiSuccessBody<T = unknown> {
  success: true
  data:    T
  message?: string
}

/**
 * Builds the standard error envelope.
 *
 * @param code    - Machine-readable error code (e.g. 'RATE_LIMIT_EXCEEDED')
 * @param message - Human-readable message shown to the client
 * @param field   - Optional: which field caused a validation error
 */
export function errorResponse(
  code:    string,
  message: string,
  field?:  string,
): ApiErrorBody {
  return {
    success: false,
    error: {
      code,
      message,
      ...(field ? { field } : {}),
    },
  }
}

/**
 * Builds the standard success envelope.
 */
export function successResponse<T>(data: T, message?: string): ApiSuccessBody<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  }
}