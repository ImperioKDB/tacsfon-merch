import { attachRequestId }             from '../requestId.js'
import { logRequest }                  from './logger.js'
import { applyCors }                   from './cors.js'
import { validateAuth, optionalAuth }  from './auth.js'
import { requireAdmin }                from './roleGuard.js'
import { handleError }                 from '../errorHandler.js'
import { checkRateLimit, getClientIp } from '../rateLimit.js'

/**
 * Wraps every API route with the full middleware stack:
 *   1. Request ID  2. Logger  3. CORS  4. Rate Limit
 *   5. Auth  6. Role Guard  7. Handler  8. Error Catcher
 *
 * Options:
 *   requireAuth  {boolean} — validate JWT
 *   requireAdmin {boolean} — requireAuth + admin role check
 *   optionalAuth {boolean} — attach req.user if token present
 *   rateLimit    {string}  — 'auth' | 'cart' | 'order' | 'upload' | 'admin'
 */
export function withMiddleware(handler, options = {}) {
  return async (req, res) => {

    attachRequestId(req, res)
    logRequest(req)

    const preflightHandled = applyCors(req, res)
    if (preflightHandled) return

    try {

      // Pre-auth rate limit (IP-based — for auth routes)
      if (options.rateLimit === 'auth') {
        checkRateLimit(getClientIp(req), 'auth')
      }

      // Auth
      if (options.requireAdmin || options.requireAuth) {
        req.user = await validateAuth(req)
      } else if (options.optionalAuth) {
        req.user = await optionalAuth(req)
      }

      // Post-auth rate limit (user ID-based)
      if (options.rateLimit && options.rateLimit !== 'auth' && req.user?.id) {
        checkRateLimit(req.user.id, options.rateLimit)
      }

      // Role Guard
      if (options.requireAdmin) {
        await requireAdmin(req.user.id)
      }

      await handler(req, res)

    } catch (err) {
      handleError(err, req, res)
    }
  }
}
