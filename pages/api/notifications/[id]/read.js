/**
 * PATCH /api/notifications/:id/read
 *
 * Marks a single notification as read.
 * Notification must belong to the authenticated user.
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { authMiddleware } from '../../../../lib/middleware/auth.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: notificationId } = req.query
  const userId                  = req.user.id

  // 1. Verify notification exists and belongs to this user
  const { data: notification, error: fetchErr } = await supabaseAdmin
    .from('notifications')
    .select('id, user_id, is_read')
    .eq('id', notificationId)
    .single()

  if (fetchErr || !notification || notification.user_id !== userId) {
    throw new ApiError('NOT_FOUND', 'Notification not found.', 404)
  }

  // 2. Mark as read
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(`Failed to mark notification as read: ${updateErr.message}`)
  }

  return sendSuccess(res, updated, 'Notification marked as read.')
}

export default withMiddleware(handler, [authMiddleware])
