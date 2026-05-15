/**
 * DELETE /api/admin/admins/:id
 *
 * Deletes an admin account from Supabase Auth.
 * Guard: cannot delete own account.
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { logAdminAction } from '../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use DELETE.' } })
  }

  const { id: targetId } = req.query
  const adminId = req.user.id

  if (targetId === adminId) {
    throw new ApiError('FORBIDDEN', 'You cannot delete your own admin account.', 403)
  }

  const { data: profile, error: pErr } = await supabaseAdmin
    .from('profiles').select('id, role, email').eq('id', targetId).single()

  if (pErr || !profile) throw new ApiError('NOT_FOUND', 'Admin account not found.', 404)
  if (profile.role !== 'admin') {
    throw new ApiError('INVALID_INPUT', 'The specified account is not an admin.', 400)
  }

  const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(targetId)
  if (authErr) throw new Error(`Failed to delete user: ${authErr.message}`)

  await logAdminAction(adminId, 'DELETE_ADMIN', { deleted_admin_id: targetId, email: profile.email })

  return sendSuccess(res, { id: targetId }, 'Admin account deleted successfully.')
}

export default withMiddleware(handler, { requireAdmin: true })
