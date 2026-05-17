/**
 * GET /api/admin/logs
 *
 * Returns paginated admin audit logs, newest first.
 * Optional query params: admin_id, action (substring match), page, limit
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } })
  }

  const { admin_id, action, page = '1', limit = '50' } = req.query
  const pageNum  = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50))
  const from     = (pageNum - 1) * limitNum
  const to       = from + limitNum - 1

  let query = supabaseAdmin
    .from('admin_logs')
    .select(`
      id, action, details, created_at,
      admin:profiles ( id, full_name, email )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (admin_id) query = query.eq('admin_id', admin_id)
  if (action)   query = query.ilike('action', `%${action}%`)

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch logs: ${error.message}`)

  return sendSuccess(res, {
    logs: data,
    pagination: {
      page: pageNum, limit: limitNum, total: count,
      total_pages: Math.ceil(count / limitNum),
    },
  })
}

export default withMiddleware(handler, { requireAdmin: true })
