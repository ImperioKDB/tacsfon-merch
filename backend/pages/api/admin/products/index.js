/**
 * POST /api/admin/products
 *
 * Creates a new product.
 * Body: { name, description?, base_price, category_id, stock_type, is_available? }
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { logAdminAction } from '../../../../lib/admin/adminLogger.js'

const VALID_STOCK_TYPES = ['stock', 'preorder', 'both']

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const adminId = req.user.id
  const { name, description, base_price, category_id, stock_type, is_available = true } = req.body

  if (!name?.trim()) throw new ApiError('INVALID_INPUT', 'name is required.', 400)
  if (base_price === undefined || isNaN(Number(base_price)) || Number(base_price) < 0) {
    throw new ApiError('INVALID_INPUT', 'base_price must be a non-negative number.', 400)
  }
  if (!category_id) throw new ApiError('INVALID_INPUT', 'category_id is required.', 400)
  if (!VALID_STOCK_TYPES.includes(stock_type)) {
    throw new ApiError('INVALID_INPUT', `stock_type must be one of: ${VALID_STOCK_TYPES.join(', ')}.`, 400)
  }

  const { data: cat, error: catErr } = await supabaseAdmin
    .from('categories').select('id').eq('id', category_id).single()

  if (catErr || !cat) throw new ApiError('INVALID_REFERENCE', 'category_id does not exist.', 400)

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: name.trim(), description: description?.trim() || null,
      base_price: Number(base_price), category_id, stock_type,
      is_available: Boolean(is_available),
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
    .select().single()

  if (error) throw new Error(`Failed to create product: ${error.message}`)

  await logAdminAction(adminId, 'CREATE_PRODUCT', { product_id: product.id, name: product.name })

  return sendSuccess(res, product, 'Product created successfully.', 201)
}

export default withMiddleware(handler, { requireAdmin: true })
