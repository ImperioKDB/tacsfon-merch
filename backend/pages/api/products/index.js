import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../../lib/supabase.js'

async function handler(req, res) {
  const { category_id, page = 1, limit = 20 } = req.query
  const from = (page - 1) * limit
  const to = from + limit - 1
  let query = supabaseAdmin.from('products').select('*, categories(name), product_variants(id, size, color, stock_qty, price_override)', { count: 'exact' }).eq('is_available', true).order('created_at', { ascending: false }).range(from, to)
  if (category_id) query = query.eq('category_id', category_id)
  const { data, count } = await query
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
  return sendSuccess(res, { products: data, total: count })
}
export default withMiddleware(handler, { optionalAuth: true })