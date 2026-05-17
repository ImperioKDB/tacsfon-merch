/**
 * POST /api/admin/admins
 *
 * Creates a new admin account via Supabase Auth Admin API.
 * Body: { email, full_name, password }
 *
 * - Creates auth user with email_confirm: true
 * - Sets role = 'admin' in profiles table
 * - Rolls back auth user if profile upsert fails
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { logAdminAction } from '../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const adminId = req.user.id
  const { email, full_name, password } = req.body

  if (!email?.trim())     throw new ApiError('INVALID_INPUT', 'email is required.', 400)
  if (!full_name?.trim()) throw new ApiError('INVALID_INPUT', 'full_name is required.', 400)
  if (!password || password.length < 8) {
    throw new ApiError('INVALID_INPUT', 'password must be at least 8 characters.', 400)
  }

  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(), password, email_confirm: true,
    user_metadata: { full_name: full_name.trim() },
  })

  if (authErr) {
    if (authErr.message?.toLowerCase().includes('already been registered') ||
        authErr.message?.toLowerCase().includes('already exists')) {
      throw new ApiError('DUPLICATE_ENTRY', 'An account with this email already exists.', 409)
    }
    throw new Error(`Failed to create user: ${authErr.message}`)
  }

  const newUserId = authData.user.id

  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: newUserId, email: email.trim(), full_name: full_name.trim(), role: 'admin', created_at: new Date().toISOString() })

  if (profileErr) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId).catch(() => {})
    throw new Error(`Failed to set admin profile: ${profileErr.message}`)
  }

  await logAdminAction(adminId, 'CREATE_ADMIN', { new_admin_id: newUserId, email: email.trim() })

  return sendSuccess(res, { id: newUserId, email: email.trim(), full_name: full_name.trim(), role: 'admin' }, 'Admin account created successfully.', 201)
}

export default withMiddleware(handler, { requireAdmin: true })
