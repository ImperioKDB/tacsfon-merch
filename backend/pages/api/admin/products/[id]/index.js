/**
 * PATCH  /api/admin/products/:id  — Update any product field
 * DELETE /api/admin/products/:id  — Soft-delete if has order history; hard-delete otherwise
 */
import { withMiddleware } from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../../lib/supabase.js'
import { logAdminAction } from '../../../../../lib/admin/adminLogger.js'

const VALID_STOCK_TYPES = ['stock', 'preorder', 'both']

async function handler(req, res) {
  if (!['PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH or DELETE.' } })
  }

  const { id } = req.query
  const adminId = req.user.id

  if (req.method === 'PATCH')  return updateProduct(req, res, id, adminId)
  if (req.method === 'DELETE') return deleteProduct(req, res, id, adminId)
}

async function updateProduct(req, res, productId, adminId) {
  const { name, description, base_price, category_id, stock_type, is_available } = req.body
  const updates = { updated_at: new Date().toISOString() }
  const changed = []

  if (name !== undefined)        { updates.name = name.trim(); changed.push('name') }
  if (description !== undefined) { updates.description = description?.trim() || null; changed.push('description') }
  if (base_price !== undefined) {
    if (isNaN(Number(base_price)) || Number(base_price) < 0) {
      throw new ApiError('INVALID_INPUT', 'base_price must be a non-negative number.', 400)
    }
    updates.base_price = Number(base_price); changed.push('base_price')
  }
  if (category_id !== undefined) { updates.category_id = category_id; changed.push('category_id') }
  if (stock_type !== undefined) {
    if (!VALID_STOCK_TYPES.includes(stock_type)) {
      throw new ApiError('INVALID_INPUT', `stock_type must be one of: ${VALID_STOCK_TYPES.join(', ')}.`, 400)
    }
    updates.stock_type = stock_type; changed.push('stock_type')
  }
  if (is_available !== undefined) { updates.is_available = Boolean(is_available); changed.push('is_available') }

  const { data: product, error } = await supabaseAdmin
    .from('products').update(updates).eq('id', productId).select().single()

  if (error || !product) throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found.', 404)

  await logAdminAction(adminId, 'UPDATE_PRODUCT', { product_id: productId, changed_fields: changed })

  return sendSuccess(res, product, 'Product updated successfully.')
}

async function deleteProduct(req, res, productId, adminId) {
  const { data: variants } = await supabaseAdmin
    .from('product_variants').select('id').eq('product_id', productId)

  const variantIds = (variants || []).map(v => v.id)
  let hasOrders = false

  if (variantIds.length > 0) {
    const { count } = await supabaseAdmin
      .from('order_items').select('id', { count: 'exact', head: true }).in('variant_id', variantIds)
    hasOrders = count > 0
  }

  if (hasOrders) {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({ is_available: false, updated_at: new Date().toISOString() })
      .eq('id', productId).select().single()

    if (error || !product) throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found.', 404)

    await logAdminAction(adminId, 'SOFT_DELETE_PRODUCT', { product_id: productId, reason: 'has_order_history' })
    return sendSuccess(res, { id: productId, is_available: false }, 'Product hidden (soft-deleted — has order history).')
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', productId)
  if (error) throw new Error(`Failed to delete product: ${error.message}`)

  await logAdminAction(adminId, 'DELETE_PRODUCT', { product_id: productId })
  return sendSuccess(res, { id: productId }, 'Product permanently deleted.')
}

export default withMiddleware(handler, { requireAdmin: true })
