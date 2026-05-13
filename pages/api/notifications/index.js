/**
 * GET /api/notifications
 *
 * Returns the authenticated student's notifications, newest first.
 * Supports optional ?unread_only=true query param.
 */
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { authMiddleware } from '../../../lib/middleware/auth.js'
import { sendSuccess }    from '../../../lib/responseFormatter.js'
import { supabaseAdmin }  from '../../../lib/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } })
  }

  const userId      = req.user.id
  const unreadOnly  = req.query.unread_only === 'true'

  let query = supabaseAdmin
    .from('notifications')
    .select('id, message, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }

  return sendSuccess(res, {
    notifications: data,
    total:         data.length,
    unread:        data.filter(n => !n.is_read).length,
  })
}

export default withMiddleware(handler, [authMiddleware])
