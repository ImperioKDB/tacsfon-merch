/**
 * PATCH /api/notifications/read-all
 *
 * Marks ALL unread notifications as read for the authenticated user.
 * Useful for a "Mark all as read" button in the frontend.
 */
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../lib/responseFormatter.js'
import { supabaseAdmin }  from '../../../lib/supabase.js'

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const userId = req.user.id

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new Error(`Failed to mark notifications as read: ${error.message}`)
  }

  return sendSuccess(res, null, 'All notifications marked as read.')
}

export default withMiddleware(handler, { requireAuth: true })