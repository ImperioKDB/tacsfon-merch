/**
 * POST /api/admin/orders/walkin — record walk-in order
 * Phase 12: rate limit 'admin' + zod validation
 */
import { withMiddleware }    from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }       from '../../../../lib/responseFormatter.js'
import { ApiError }          from '../../../../lib/errorHandler.js'
import { supabaseAdmin }     from '../../../../lib/supabase.js'
import { logAdminAction }    from '../../../../lib/admin/adminLogger.js'
import { validateBody }      from '../../../../lib/middleware/validate.js'
import { WalkinOrderSchema } from '../../../../lib/schemas/adminSchemas.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const adminId = req.user.id
  const { customer_name, phone, items, delivery_address } = validateBody(req, WalkinOrderSchema)

  let total = 0
  const enrichedItems = []

  for (const item of items) {
    const { product_id, variant_id, quantity } = item

    const { data: product, error: pErr } = await supabaseAdmin
      .from('products').select('id, name, base_price, is_available').eq('id', product_id).single()
    if (pErr || !product) throw new ApiError('PRODUCT_NOT_FOUND', `Product ${product_id} not found.`, 404)
    if (!product.is_available) throw new ApiError('PRODUCT_UNAVAILABLE', `'${product.name}' is not available.`, 400)

    const { data: variant, error: vErr } = await supabaseAdmin
      .from('product_variants').select('id, price_override, product_id').eq('id', variant_id).single()
    if (vErr || !variant || variant.product_id !== product_id) {
      throw new ApiError('VARIANT_NOT_FOUND', `Variant ${variant_id} not found for this product.`, 404)
    }

    const unitPrice = variant.price_override ?? product.base_price
    const qty = Number(quantity)
    total += unitPrice * qty
    enrichedItems.push({ product_id, variant_id, quantity: qty, unit_price: unitPrice })
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: null, customer_name: customer_name.trim(), phone: phone.trim(),
      type: 'walkin', status: 'confirmed', payment_status: 'paid', total,
      delivery_address: delivery_address?.trim() || null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).select().single()

  if (orderErr) throw new Error(`Failed to create walk-in order: ${orderErr.message}`)

  const { error: itemsErr } = await supabaseAdmin
    .from('order_items').insert(enrichedItems.map(i => ({ ...i, order_id: order.id })))

  if (itemsErr) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id).catch(() => {})
    throw new Error(`Failed to insert order items: ${itemsErr.message}`)
  }

  await logAdminAction(adminId, 'CREATE_WALKIN_ORDER', {
    order_id: order.id, customer_name: customer_name.trim(), total, item_count: enrichedItems.length,
  })

  return sendSuccess(res, order, 'Walk-in order recorded successfully.', 201)
}

export default withMiddleware(handler, { requireAdmin: true, rateLimit: 'admin' })
