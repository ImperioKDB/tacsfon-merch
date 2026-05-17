import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess, sendError } from '../../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { assertMethod } from '../../../lib/validate.js'

/**
 * GET /api/products
 *
 * Query params:
 *   category_id   - filter by category UUID
 *   is_available  - 'true' (default for guests) | 'false' | 'all' (admin only)
 *   stock_type    - 'stock' | 'preorder' | 'both'
 *   page          - page number (default 1)
 *   limit         - items per page (default 20, max 100)
 *
 * Public route — auth is optional so admins can pass is_available=all.
 *
 * Phase 3 — Products & Catalogue
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  const {
    category_id,
    is_available,
    stock_type,
    page  = '1',
    limit = '20',
  } = req.query

  // ── Pagination ───────────────────────────────
  const pageNum  = Math.max(1, parseInt(page,  10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  const from     = (pageNum - 1) * limitNum
  const to       = from + limitNum - 1

  // ── Base query ───────────────────────────────
  let query = supabaseAdmin
    .from('products')
    .select(
      `id, name, description, base_price, image_url, model_url,
       is_available, stock_type, created_at, updated_at,
       categories ( id, name )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  // ── Availability filter ──────────────────────
  // Admins can pass is_available=all to see everything
  // Non-admins always see only available products
  const isAdmin = req.user?.role === 'admin'

  if (is_available === 'all' && isAdmin) {
    // no filter — return everything
  } else if (is_available === 'false' && isAdmin) {
    query = query.eq('is_available', false)
  } else {
    // default: guests + non-admin authenticated users see only available
    query = query.eq('is_available', true)
  }

  // ── Optional filters ─────────────────────────
  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  if (stock_type && ['stock', 'preorder', 'both'].includes(stock_type)) {
    query = query.eq('stock_type', stock_type)
  }

  const { data: products, error, count } = await query

  if (error) throw error

  return sendSuccess(res, {
    products: products ?? [],
    pagination: {
      page:       pageNum,
      limit:      limitNum,
      total:      count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limitNum),
    },
  })
}

// Optional auth so admins can use is_available=all
export default withMiddleware(handler, { optionalAuth: true })
