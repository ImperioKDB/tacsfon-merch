import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

/**
 * Extracts and validates the user's JWT.
 * Checks Authorization: Bearer <token> header first, then sb-access-token cookie.
 *
 * On success: returns the Supabase user object (attached to req.user by withMiddleware).
 * On failure: throws ApiError(UNAUTHORIZED, 401).
 *
 * Auth errors ALWAYS return 401 or 403 — never 404.
 * (Don't leak whether a resource exists to unauthenticated users.)
 */
export async function validateAuth(req) {
  const authHeader = req.headers.authorization
  let token = null

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.cookies?.['sb-access-token']) {
    token = req.cookies['sb-access-token']
  }

  if (!token) {
    throw new ApiError('UNAUTHORIZED', 'No authentication token provided.', 401)
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    throw new ApiError('UNAUTHORIZED', 'Invalid or expired token. Please sign in again.', 401)
  }

  return user
}

/**
 * Like validateAuth but doesn't throw if no token is present.
 * Use for routes that work for both guests and authenticated users.
 * Returns the user object or null.
 */
export async function optionalAuth(req) {
  try {
    return await validateAuth(req)
  } catch {
    return null
  }
}
