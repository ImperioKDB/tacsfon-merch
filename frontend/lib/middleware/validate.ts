/**
 * validate — Request body, query-string, and UUID validation helpers
 *
 * Uses Zod schemas from '@/lib/validation/schemas'.
 * Returns a discriminated union so call-sites can do a simple null-check:
 *
 *   // Body
 *   const { data, error } = await validateBody(req, cartAddSchema)
 *   if (error) return error   // NextResponse 400 already built
 *
 *   // Query string
 *   const { data, error } = validateQuery(req, logsQuerySchema)
 *   if (error) return error
 *
 *   // Route param UUID
 *   const { id, error } = validateUUID(params.id, 'product_id')
 *   if (error) return error
 */
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema }                 from 'zod'
import { errorResponse }             from '@/lib/api/response'

// ── Types ────────────────────────────────────────────────────────────────────

type ValidationResult<T> =
  | { data: T;    error: null }
  | { data: null; error: NextResponse }

type UUIDResult =
  | { id: string; error: null }
  | { id: null;   error: NextResponse }

// ── Body validation ──────────────────────────────────────────────────────────

export async function validateBody<T>(
  req:    NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  let raw: unknown

  try {
    raw = await req.json()
  } catch {
    return {
      data:  null,
      error: NextResponse.json(
        errorResponse('INVALID_JSON', 'Request body must be valid JSON.'),
        { status: 400 }
      ),
    }
  }

  const result = schema.safeParse(raw)

  if (!result.success) {
    const fields = result.error.issues.map(i => ({
      field:   i.path.join('.') || 'root',
      message: i.message,
    }))

    return {
      data:  null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code:    'VALIDATION_ERROR',
            message: 'Request body validation failed.',
            fields,
          },
        },
        { status: 400 }
      ),
    }
  }

  return { data: result.data, error: null }
}

// ── Query string validation ──────────────────────────────────────────────────

export function validateQuery<T>(
  req:    NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const raw    = Object.fromEntries(req.nextUrl.searchParams.entries())
  const result = schema.safeParse(raw)

  if (!result.success) {
    const fields = result.error.issues.map(i => ({
      field:   i.path.join('.') || 'root',
      message: i.message,
    }))

    return {
      data:  null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code:    'VALIDATION_ERROR',
            message: 'Invalid query parameters.',
            fields,
          },
        },
        { status: 400 }
      ),
    }
  }

  return { data: result.data, error: null }
}

// ── UUID route-param validation ──────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validate a route parameter as a UUID before passing it to the database.
 * Prevents injection of arbitrary strings into Supabase queries.
 *
 * @param value     - The raw string from params (e.g. params.id)
 * @param fieldName - Human-readable field name shown in the error response
 */
export function validateUUID(value: string, fieldName = 'id'): UUIDResult {
  if (!UUID_RE.test(value)) {
    return {
      id:    null,
      error: NextResponse.json(
        errorResponse(
          'INVALID_ID',
          `The '${fieldName}' parameter is not a valid ID.`,
          fieldName
        ),
        { status: 400 }
      ),
    }
  }

  return { id: value, error: null }
}
