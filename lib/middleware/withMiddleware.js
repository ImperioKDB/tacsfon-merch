import { attachRequestId } from '../requestId.js'
import { logRequest } from './logger.js'
import { applyCors } from './cors.js'
import { validateAuth, optionalAuth } from './auth.js'
import { requireAdmin } from './roleGuard.js'
import { handleError } from '../errorHandler.js'

/**
 * Wraps a Next.js API route handler with the full middleware stack:
 *
 *   1. Request ID     — attaches UUID to req.requestId, sets X-Request-ID header
 *   2. Logger         — logs method, path, timestamp, requestId
 *   3. CORS           — handles preflight and origin validation
 *   4. Auth           — validates JWT and attaches user to req.user (optional per route)
 *   5. Role Guard     — checks admin role via DB RPC (optional per route)
 *   6. Route Handler  — your actual business logic
 *   7. Error Catcher  — catches all thrown errors and returns clean JSON
 *
 * Options:
 *   requireAuth   {boolean} — validate JWT, attach req.user (default: false)
 *   requireAdmin  {boolean} — requireAuth + admin role check (default: false)
 *   optionalAuth  {boolean} — attach req.user if token present, null if not (default: false)
 *
 * Usage:
 *   export default withMiddleware(handler, { requireAuth: true })
 *   export default withMiddleware(adminHandler, { requireAdmin: true })
 */
export function withMiddleware(handler, options = {}) {
  return async (req, res) => {

    // 1. Request ID
    attachRequestId(req, res)

    // 2. Log incoming request
    logRequest(req)

    // 3. CORS (handles preflight and terminates early for OPTIONS)
    const preflightHandled = applyCors(req, res)
    if (preflightHandled) return

    try {

      // 4. Auth — runs if any auth option is enabled
      if (options.requireAdmin || options.requireAuth) {
        req.user = await validateAuth(req)
      } else if (options.optionalAuth) {
        req.user = await optionalAuth(req)
      }

      // 5. Role Guard — runs only for admin routes
      if (options.requireAdmin) {
        await requireAdmin(req.user.id)
      }

      // 6. Route handler
      await handler(req, res)

    } catch (err) {

      // 7. Central error handler
      handleError(err, req, res)

    }
  }
}
