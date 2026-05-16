/**
 * lib/rateLimit.js
 *
 * In-memory rate limiter — no external service required.
 * Uses a sliding window counter per key (IP or userId).
 *
 * Limits (per spec):
 *   auth:    5  requests / minute per IP
 *   cart:    30 requests / minute per user
 *   order:   3  requests / minute per user
 *   upload:  10 requests / minute per user
 *   admin:   60 requests / minute per admin
 */
import { ApiError } from './errorHandler.js'

const store    = new Map()
const WINDOW_MS = 60_000

const LIMITS = {
  auth:   5,
  cart:   30,
  order:  3,
  upload: 10,
  admin:  60,
}

export function checkRateLimit(key, bucket) {
  const limit = LIMITS[bucket]
  if (!limit) return

  const storeKey = `${bucket}:${key}`
  const now      = Date.now()
  const entry    = store.get(storeKey)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(storeKey, { count: 1, windowStart: now })
    return
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000)
    throw new ApiError(
      'RATE_LIMIT_EXCEEDED',
      `Too many requests. Please wait ${retryAfter} seconds and try again.`,
      429
    )
  }

  entry.count++
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= WINDOW_MS * 2) store.delete(key)
  }
}, 5 * 60_000)
