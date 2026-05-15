/**
 * POST /api/admin/products/:id/variants
 *
 * Adds a variant to a product.
 * Body: { size, color, stock_qty?, price_override? }
 */
import { withMiddleware } from '../../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../../../lib/supabase.js'
import { logAdminAction } from '../../../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const { id: productId } = req.query
  const adminId = req.user.id
  const { size, color, stock_qty = 0, price_override = null } = req.body

  if (!size?.toString().trim())  throw new ApiError('INVALID_INPUT', 'size is required.', 400)
  if (!color?.toString().trim()) throw new ApiError('INVALID_INPUT', 'color is required.', 400)
  if (Number(stock_qty) < 0)     throw new ApiError('INVALID_INPUT', 'stock_qty must be >= 0.', 400)
  if (price_override !== null && (isNaN(Number(price_override)) || Number(price_override) < 0)) {
    throw new ApiError('INVALID_INPUT', 'price_override must be a non-negative number or null.', 400)
  }

  const { data: product, error: pErr } = await supabaseAdmin
    .from('products').select('id').eq('id', productId).single()

  if (pErr || !product) throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found.', 404)

  const { data: variant, error } = await supabaseAdmin
    .from('product_variants')
    .insert({
      product_id: productId, size: size.toString().trim(), color: color.toString().trim(),
      stock_qty: Number(stock_qty), price_override: price_override !== null ? Number(price_override) : null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
    .select().single()

  if (error) throw new Error(`Failed to create variant: ${error.message}`)

  await logAdminAction(adminId, 'CREATE_VARIANT', { product_id: productId, variant_id: variant.id })

  return sendSuccess(res, variant, 'Variant added successfully.', 201)
}

export default withMiddleware(handler, { requireAdmin: true })
