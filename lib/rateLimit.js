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
 *
 * NOTE: In-memory means limits reset on server restart and are NOT
 * shared across multiple Render instances. For a single free-tier
 * instance this is perfectly adequate. Upgrade to Upstash Redis
 * when you scale to multiple instances.
 */
import { ApiError } from './errorHandler.js'

// key → { count, windowStart }
const store = new Map()

// Window duration: 60 seconds
const WINDOW_MS = 60_000

const LIMITS = {
  auth:   5,
  cart:   30,
  order:  3,
  upload: 10,
  admin:  60,
}

/**
 * Checks and increments the rate limit counter for a given key + bucket.
 * Throws ApiError(RATE_LIMIT_EXCEEDED, 429) if over limit.
 *
 * @param {string} key    - unique identifier (IP address or userId)
 * @param {'auth'|'cart'|'order'|'upload'|'admin'} bucket
 */
export function checkRateLimit(key, bucket) {
  const limit = LIMITS[bucket]
  if (!limit) return  // unknown bucket — skip

  const storeKey = `${bucket}:${key}`
  const now      = Date.now()
  const entry    = store.get(storeKey)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // New window
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

/**
 * Returns the IP address of the incoming request.
 * Respects X-Forwarded-For set by Render's proxy.
 *
 * @param {import('next').NextApiRequest} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// Clean up stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= WINDOW_MS * 2) {
      store.delete(key)
    }
  }
}, 5 * 60_000)
