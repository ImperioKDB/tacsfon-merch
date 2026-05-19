/**
 * lib/api/response.ts
 *
 * Shared response-shape helpers for Next.js App Router route handlers.
 *
 * Imported by:
 *   - lib/middleware/rateLimit.ts
 *   - lib/middleware/validate.ts
 *
 * Error envelope:   { success: false, error: { code, message, field? } }
 * Success envelope: { success: true,  data: T, message?: string }
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  success: false
  error: {
    code:    string
    message: string
    field?:  string
  }
}

export interface ApiSuccessBody<T = unknown> {
  success:  true
  data:     T
  message?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the standard error envelope.
 *
 * @param code    Machine-readable error code  e.g. 'RATE_LIMIT_EXCEEDED'
 * @param message Human-readable message shown to the client
 * @param field   Optional — which field caused a validation error
 *
 * @example
 *   return NextResponse.json(
 *     errorResponse('NOT_FOUND', 'Product not found.'),
 *     { status: 404 }
 *   )
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
      ...(field !== undefined ? { field } : {}),
    },
  }
}

/**
 * Build the standard success envelope.
 *
 * @param data    Payload to include under `data`
 * @param message Optional human-readable message
 *
 * @example
 *   return NextResponse.json(
 *     successResponse(product),
 *     { status: 200 }
 *   )
 */
export function successResponse<T>(
  data:     T,
  message?: string,
): ApiSuccessBody<T> {
  return {
    success: true,
    data,
    ...(message !== undefined ? { message } : {}),
  }
}