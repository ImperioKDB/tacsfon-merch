import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { assertMethod } from '../../../lib/validate.js'

/**
 * POST /api/auth/signout
 *
 * Invalidates the user's Supabase session server-side, then clears
 * the auth cookie so the browser no longer sends it.
 *
 * Note: Supabase's signOut() revokes the refresh token. The access token
 * remains technically valid until it expires (default 1 hour), but
 * without a refresh token the session cannot be renewed.
 *
 * Frontend should also call supabase.auth.signOut() on the client side
 * to clear the in-memory session object.
 */
async function handler(req, res) {
  assertMethod(req, ['POST'])

  // Get the token that was used to authenticate this request
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.['sb-access-token']

  // Revoke the session server-side via the admin client
  if (token) {
    // getUser resolves the user, then we use their session to sign out
    await supabaseAdmin.auth.admin.signOut(token).catch(() => {
      // Best-effort — if revocation fails, we still clear the cookie
    })
  }

  // Clear the auth cookie (set to expired)
  res.setHeader('Set-Cookie', [
    'sb-access-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    'sb-refresh-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
  ])

  return sendSuccess(res, null, 'Signed out successfully.')
}

export default withMiddleware(handler, { requireAuth: true })
