import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { ApiError } from '../../../lib/errorHandler.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { assertMethod, validateUUID } from '../../../lib/validate.js'

/**
 * GET /api/products/:id
 *
 * Returns a single product with its full variant list.
 * - Guests / students: only see available products (404 if unavailable)
 * - Admins: can see unavailable products too
 *
 * Cache header: 30-second stale-while-revalidate
 *
 * Phase 3 — Products & Catalogue
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  const { id } = req.query
  validateUUID(id, 'product id')

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(
      `id, name, description, base_price, image_url, model_url,
       is_available, stock_type, created_at, updated_at,
       categories ( id, name ),
       product_variants (
         id, size, color, stock_qty, price_override, created_at
       )`
    )
    .eq('id', id)
    .single()

  if (error || !product) {
    throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found.', 404)
  }

  // Non-admins cannot see unavailable products
  const isAdmin = req.user?.role === 'admin'
  if (!product.is_available && !isAdmin) {
    throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found.', 404)
  }

  // 30-second cache (CDN + browser)
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

  return sendSuccess(res, product)
}

// Optional auth so admins can view unavailable products
export default withMiddleware(handler, { optionalAuth: true })
