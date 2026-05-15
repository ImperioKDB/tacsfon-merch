/**
 * PATCH  /api/admin/products/:id/variants/:variant_id  — Update variant fields
 * DELETE /api/admin/products/:id/variants/:variant_id  — Delete variant (blocked if in orders)
 */
import { withMiddleware } from '../../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../../../lib/supabase.js'
import { logAdminAction } from '../../../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (!['PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH or DELETE.' } })
  }

  const { id: productId, variant_id } = req.query
  const adminId = req.user.id

  if (req.method === 'PATCH')  return updateVariant(req, res, productId, variant_id, adminId)
  if (req.method === 'DELETE') return deleteVariant(req, res, productId, variant_id, adminId)
}

async function updateVariant(req, res, productId, variantId, adminId) {
  const { stock_qty, price_override, size, color } = req.body
  const updates = { updated_at: new Date().toISOString() }
  const changed = []

  if (stock_qty !== undefined) {
    if (Number(stock_qty) < 0) throw new ApiError('INVALID_INPUT', 'stock_qty must be >= 0.', 400)
    updates.stock_qty = Number(stock_qty); changed.push('stock_qty')
  }
  if (price_override !== undefined) {
    if (price_override !== null && (isNaN(Number(price_override)) || Number(price_override) < 0)) {
      throw new ApiError('INVALID_INPUT', 'price_override must be a non-negative number or null.', 400)
    }
    updates.price_override = price_override !== null ? Number(price_override) : null
    changed.push('price_override')
  }
  if (size !== undefined)  { updates.size  = size.toString().trim();  changed.push('size')  }
  if (color !== undefined) { updates.color = color.toString().trim(); changed.push('color') }

  const { data: variant, error } = await supabaseAdmin
    .from('product_variants').update(updates)
    .eq('id', variantId).eq('product_id', productId).select().single()

  if (error || !variant) throw new ApiError('VARIANT_NOT_FOUND', 'Variant not found.', 404)

  await logAdminAction(adminId, 'UPDATE_VARIANT', { product_id: productId, variant_id: variantId, changed_fields: changed })

  return sendSuccess(res, variant, 'Variant updated successfully.')
}

async function deleteVariant(req, res, productId, variantId, adminId) {
  const { count } = await supabaseAdmin
    .from('order_items').select('id', { count: 'exact', head: true }).eq('variant_id', variantId)

  if (count > 0) {
    throw new ApiError(
      'VARIANT_IN_USE',
      'Cannot delete this variant — it is referenced in existing orders. Set stock_qty to 0 instead.',
      409
    )
  }

  const { error } = await supabaseAdmin
    .from('product_variants').delete().eq('id', variantId).eq('product_id', productId)

  if (error) throw new Error(`Failed to delete variant: ${error.message}`)

  await logAdminAction(adminId, 'DELETE_VARIANT', { product_id: productId, variant_id: variantId })

  return sendSuccess(res, { id: variantId }, 'Variant deleted successfully.')
}

export default withMiddleware(handler, { requireAdmin: true })
