import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { sendSuccess, sendError } from '../../../lib/responseFormatter.js'
import { assertMethod } from '../../../lib/validate.js'

/**
 * GET /api/auth/session
 *
 * Returns the authenticated user's profile from the `profiles` table.
 * - Requires a valid JWT in Authorization header or sb-access-token cookie.
 * - Returns 401 if no valid session exists.
 *
 * Response data shape:
 * {
 *   id, email, full_name, role, avatar_url, created_at
 * }
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  // req.user is attached by withMiddleware when requireAuth: true
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .eq('id', req.user.id)
    .single()

  if (error || !profile) {
    // User exists in auth.users but has no profile row — this shouldn't happen
    // in normal flow, but handle it gracefully.
    return sendError(
      res,
      'PROFILE_NOT_FOUND',
      'User profile not found. Please sign in again.',
      404
    )
  }

  return sendSuccess(res, profile)
}

export default withMiddleware(handler, { requireAuth: true })
