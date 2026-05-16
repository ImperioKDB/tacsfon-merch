/**
 * POST /api/admin/orders/walkin
 *
 * Records a walk-in order (customer pays in person).
 * Body: { customer_name, phone, items: [{ product_id, variant_id, quantity }], delivery_address? }
 *
 * Walk-in orders:
 *   - type           = 'walkin'
 *   - status         = 'confirmed'
 *   - payment_status = 'paid'
 *   - user_id        = null (no account required)
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { logAdminAction } from '../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const adminId = req.user.id
  const { customer_name, phone, items, delivery_address = '' } = req.body

  if (!customer_name?.trim()) throw new ApiError('INVALID_INPUT', 'customer_name is required.', 400)
  if (!phone?.trim())         throw new ApiError('INVALID_INPUT', 'phone is required.', 400)
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError('INVALID_INPUT', 'items must be a non-empty array.', 400)
  }

  let total = 0
  const enrichedItems = []

  for (const item of items) {
    const { product_id, variant_id, quantity } = item

    if (!product_id || !variant_id || !quantity || Number(quantity) < 1) {
      throw new ApiError('INVALID_INPUT', 'Each item needs product_id, variant_id, and quantity >= 1.', 400)
    }

    const { data: product, error: pErr } = await supabaseAdmin
      .from('products')
      .select('id, name, base_price, is_available')
      .eq('id', product_id)
      .single()

    if (pErr || !product) throw new ApiError('PRODUCT_NOT_FOUND', `Product ${product_id} not found.`, 404)
    if (!product.is_available) {
      throw new ApiError('PRODUCT_UNAVAILABLE', `Product '${product.name}' is not available.`, 400)
    }

    const { data: variant, error: vErr } = await supabaseAdmin
      .from('product_variants')
      .select('id, price_override, product_id')
      .eq('id', variant_id)
      .single()

    if (vErr || !variant || variant.product_id !== product_id) {
      throw new ApiError('VARIANT_NOT_FOUND', `Variant ${variant_id} not found for this product.`, 404)
    }

    const unitPrice = variant.price_override ?? product.base_price
    const qty       = Number(quantity)
    total += unitPrice * qty

    // FIX: include product_id — it's already in scope and the DB column exists
    enrichedItems.push({ product_id, variant_id, quantity: qty, unit_price: unitPrice })
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id:          null,
      customer_name:    customer_name.trim(),
      phone:            phone.trim(),
      type:             'walkin',
      status:           'confirmed',
      payment_status:   'paid',
      total,
      delivery_address: delivery_address?.trim() || null,
      created_at:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    })
    .select()
    .single()

  if (orderErr) throw new Error(`Failed to create walk-in order: ${orderErr.message}`)

  const { error: itemsErr } = await supabaseAdmin
    .from('order_items')
    .insert(enrichedItems.map(i => ({ ...i, order_id: order.id })))

  if (itemsErr) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id).catch(() => {})
    throw new Error(`Failed to insert order items: ${itemsErr.message}`)
  }

  await logAdminAction(adminId, 'CREATE_WALKIN_ORDER', {
    order_id:      order.id,
    customer_name: customer_name.trim(),
    total,
    item_count:    enrichedItems.length,
  })

  return sendSuccess(res, order, 'Walk-in order recorded successfully.', 201)
}

export default withMiddleware(handler, { requireAdmin: true })
