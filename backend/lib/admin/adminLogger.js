/**
 * lib/admin/adminLogger.js
 *
 * Logs every admin mutation to the admin_logs table.
 * Used by all /api/admin/* routes.
 *
 * @param {string} adminId  - req.user.id of the acting admin
 * @param {string} action   - e.g. 'UPDATE_PAYMENT_STATUS', 'DELETE_PRODUCT'
 * @param {object} details  - arbitrary JSON details about the action
 */
import { supabaseAdmin } from '../supabase.js'

export async function logAdminAction(adminId, action, details = {}) {
  const { error } = await supabaseAdmin
    .from('admin_logs')
    .insert({
      admin_id:   adminId,
      action,
      details,
      created_at: new Date().toISOString(),
    })

  if (error) {
    // Log failure internally but never throw — logging must not break business logic
    console.error(JSON.stringify({
      level:   'error',
      event:   'admin_log_failed',
      adminId,
      action,
      details,
      error:   error.message,
    }))
  }
}
