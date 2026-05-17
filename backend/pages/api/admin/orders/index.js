/**
 * GET /api/admin/orders
 *
 * Returns all orders (admin view), newest first.
 * Optional query params: status, payment_status, page (default 1), limit (default 20)
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } })
  }

  const { status, payment_status, page = '1', limit = '20' } = req.query
  const pageNum  = Math.max(1, parseInt(page, 10)  || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  const from     = (pageNum - 1) * limitNum
  const to       = from + limitNum - 1

  let query = supabaseAdmin
    .from('orders')
    .select(`
      id, status, payment_status, total, type,
      customer_name, delivery_address, phone, proof_url,
      created_at, updated_at,
      user:profiles ( id, full_name, email ),
      order_items (
        id, quantity, unit_price,
        product_variant:product_variants (
          id, size, color,
          product:products ( id, name )
        )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status)         query = query.eq('status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`)

  return sendSuccess(res, {
    orders: data,
    pagination: {
      page:        pageNum,
      limit:       limitNum,
      total:       count,
      total_pages: Math.ceil(count / limitNum),
    },
  })
}

export default withMiddleware(handler, { requireAdmin: true })
