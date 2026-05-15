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
 *   id, email, full_name, phone, role, created_at
 * }
 *
 * NOTE: avatar_url is not included — column does not exist in profiles table.
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  // FIX: removed avatar_url — column does not exist in DB
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, phone, role, created_at')
    .eq('id', req.user.id)
    .single()

  if (error || !profile) {
    // User exists in auth.users but has no profile row — handle gracefully.
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
