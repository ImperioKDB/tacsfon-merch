import { withMiddleware } from '../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../lib/supabase.js'
import { assertMethod } from '../../lib/validate.js'

/**
 * GET /api/health
 *
 * Public health-check endpoint. Tests:
 *   - API is reachable
 *   - Supabase service-role client can connect
 *   - X-Request-ID header is present (confirms middleware is running)
 *
 * Part of Phase 1 test checklist — hit this to verify the foundation works.
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  // Probe Supabase connectivity with a lightweight query
  const { error: dbError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .limit(1)

  return sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbError ? 'unreachable' : 'connected',
      environment: process.env.NODE_ENV || 'unknown',
    },
    'TACSFON Merch API is running.'
  )
}

export default withMiddleware(handler)
