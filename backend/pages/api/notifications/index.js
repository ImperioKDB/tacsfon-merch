
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../../lib/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const userId = req.user.id;

  // AUDIT #19: Add limit and optional pagination to prevent massive payloads
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('id, message, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50); 

  if (error) throw error;

  return sendSuccess(res, {
    notifications: data,
    unread: data.filter(n => !n.is_read).length
  });
}
export default withMiddleware(handler, { requireAuth: true });
