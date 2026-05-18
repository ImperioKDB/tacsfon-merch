/**
 * rateLimit — In-memory sliding-window rate limiter
 *
 * Limits (from Phase 12 spec):
 *   Auth routes:    5  requests / minute per IP
 *   Cart routes:    30 requests / minute per user
 *   Order creation: 3  requests / minute per user
 *   File upload:    10 requests / minute per user
 *   Admin routes:   60 requests / minute per admin
 *
 * Usage:
 *   export const POST = withRateLimit('auth', async (req) => { ... })
 *
 * Note: The in-memory store resets on cold start.
 * For persistent limits across serverless instances, swap the store
 * for Upstash Redis using @upstash/ratelimit.
 */
import { NextRequest, NextResponse } from 'next/server'
import { errorResponse }             from '@/lib/api/response'

// ── Types ────────────────────────────────────────────────────────────────────

export type RateLimitKey = 'auth' | 'cart' | 'order' | 'upload' | 'admin'

interface WindowEntry {
  count:   number
  resetAt: number
}

// ── Config ───────────────────────────────────────────────────────────────────

const LIMITS: Record<RateLimitKey, { max: number; windowMs: number }> = {
  auth:   { max: 5,  windowMs: 60_000 },
  cart:   { max: 30, windowMs: 60_000 },
  order:  { max: 3,  windowMs: 60_000 },
  upload: { max: 10, windowMs: 60_000 },
  admin:  { max: 60, windowMs: 60_000 },
}

// Global in-memory store (module-level — survives within a warm instance)
const store = new Map<string, WindowEntry>()

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`
  // Vercel sets x-forwarded-for on every request
  const forwarded = req.headers.get('x-forwarded-for')
  return `ip:${forwarded?.split(',')[0]?.trim() ?? 'unknown'}`
}

function storeKey(identifier: string, type: RateLimitKey): string {
  return `rl:${type}:${identifier}`
}

// ── Core check ───────────────────────────────────────────────────────────────

export function checkRateLimit(
  req:     NextRequest,
  type:    RateLimitKey,
  userId?: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = LIMITS[type]
  const id    = getIdentifier(req, userId)
  const key   = storeKey(id, type)
  const now   = Date.now()

  let entry = store.get(key)

  // New window or expired window
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + limit.windowMs }
    store.set(key, entry)
    return { allowed: true, remaining: limit.max - 1, resetAt: entry.resetAt }
  }

  entry.count++

  if (entry.count > limit.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: limit.max - entry.count, resetAt: entry.resetAt }
}

// ── HOC wrapper ──────────────────────────────────────────────────────────────

/**
 * Wrap any route handler with rate limiting.
 *
 * @param type       - Rate limit bucket to apply
 * @param handler    - Your async route handler
 * @param getUserId  - Optional extractor to get userId from the request
 *                     (call your auth middleware inside this if needed)
 *
 * Example:
 *   export const POST = withRateLimit(
 *     'order',
 *     async (req) => {
 *       // ... create order logic
 *     },
 *     (req) => req.headers.get('x-user-id') ?? undefined
 *   )
 */
export function withRateLimit(
  type:       RateLimitKey,
  handler:    (req: NextRequest, userId?: string) => Promise<NextResponse>,
  getUserId?: (req: NextRequest) => string | undefined
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const userId = getUserId?.(req)
    const { allowed, remaining, resetAt } = checkRateLimit(req, type, userId)

    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
      const res = NextResponse.json(
        errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down and try again.'),
        { status: 429 }
      )
      res.headers.set('Retry-After',           String(retryAfter))
      res.headers.set('X-RateLimit-Limit',     String(LIMITS[type].max))
      res.headers.set('X-RateLimit-Remaining', '0')
      res.headers.set('X-RateLimit-Reset',     String(resetAt))
      return res
    }

    const response = await handler(req, userId)

    // Attach rate limit headers to every successful response too
    response.headers.set('X-RateLimit-Limit',     String(LIMITS[type].max))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset',     String(resetAt))

    return response
  }
}
