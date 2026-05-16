/**
 * lib/middleware/withMiddleware.js
 *
 * Wraps every API route with the full middleware stack:
 *
 *   1. Request ID     — attaches UUID to req.requestId
 *   2. Logger         — logs method, path, requestId
 *   3. CORS           — handles preflight and origin validation
 *   4. Rate Limiter   — per IP or per user, by bucket
 *   5. Auth           — validates JWT, attaches req.user
 *   6. Role Guard     — checks admin role via DB RPC
 *   7. Route Handler  — business logic
 *   8. Error Catcher  — catches all throws, returns clean JSON
 *
 * Options:
 *   requireAuth   {boolean} — validate JWT (default: false)
 *   requireAdmin  {boolean} — requireAuth + admin role check (default: false)
 *   optionalAuth  {boolean} — attach req.user if token present (default: false)
 *   rateLimit     {string}  — rate limit bucket: 'auth'|'cart'|'order'|'upload'|'admin'
 *
 * Usage:
 *   export default withMiddleware(handler, { requireAuth: true, rateLimit: 'order' })
 *   export default withMiddleware(handler, { requireAdmin: true, rateLimit: 'admin' })
 */
import { attachRequestId }          from '../requestId.js'
import { logRequest }               from './logger.js'
import { applyCors }                from './cors.js'
import { validateAuth, optionalAuth } from './auth.js'
import { requireAdmin }             from './roleGuard.js'
import { handleError }              from '../errorHandler.js'
import { checkRateLimit, getClientIp } from '../rateLimit.js'

export function withMiddleware(handler, options = {}) {
  return async (req, res) => {

    // 1. Request ID
    attachRequestId(req, res)

    // 2. Log incoming request
    logRequest(req)

    // 3. CORS
    const preflightHandled = applyCors(req, res)
    if (preflightHandled) return

    try {

      // 4. Rate limiting
      if (options.rateLimit) {
        // Use userId for authenticated buckets, IP for auth (pre-login)
        const isAuthBucket = options.rateLimit === 'auth'
        const key = isAuthBucket
          ? getClientIp(req)
          : (req.user?.id || getClientIp(req))
        checkRateLimit(key, options.rateLimit)
      }

      // 5. Auth
      if (options.requireAdmin || options.requireAuth) {
        req.user = await validateAuth(req)
      } else if (options.optionalAuth) {
        req.user = await optionalAuth(req)
      }

      // Apply rate limit after auth when we have userId
      if (options.rateLimit && options.rateLimit !== 'auth' && req.user?.id) {
        checkRateLimit(req.user.id, options.rateLimit)
      }

      // 6. Role Guard
      if (options.requireAdmin) {
        await requireAdmin(req.user.id)
      }

      // 7. Route handler
      await handler(req, res)

    } catch (err) {

      // 8. Central error handler
      handleError(err, req, res)

    }
  }
}
