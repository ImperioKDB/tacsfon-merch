import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

/**
 * Verifies that the authenticated user is an admin.
 *
 * IMPORTANT: Always re-checks role from the DB via is_admin() RPC.
 * Never trust the role from JWT claims — it could be stale.
 *
 * Throws ApiError(FORBIDDEN, 403) if the user is not an admin.
 */
export async function requireAdmin(userId) {
  const { data: isAdmin, error } = await supabaseAdmin.rpc('is_admin', { user_id: userId })

  if (error) {
    // Log internally and treat as forbidden — don't leak DB errors
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'is_admin() RPC failed',
      userId,
      error: error.message,
    }))
    throw new ApiError('INTERNAL_ERROR', 'Role verification failed.', 500)
  }

  if (!isAdmin) {
    throw new ApiError('FORBIDDEN', 'Admin access is required for this operation.', 403)
  }
}
