/**
 * GET  /api/orders — list user's orders
 * POST /api/orders — place new order from cart
 * Phase 12: rate limit + zod validation
 */
import { withMiddleware }       from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess }          from '../../../lib/responseFormatter.js'
import { ApiError }             from '../../../lib/errorHandler.js'
import { supabaseAdmin }        from '../../../lib/supabase.js'
import { calculateOrderTotal }  from '../../../lib/orders/orderUtils.js'
import { notifyAdmins }         from '../../../lib/telegram/sendTelegram.js'
import { buildNewOrderMessage } from '../../../lib/telegram/orderMessage.js'
import { validateBody }         from '../../../lib/middleware/validate.js'
import { checkRateLimit }       from '../../../lib/rateLimit.js'
import { PlaceOrderSchema }     from '../../../lib/schemas/orderSchemas.js'

async function handler(req, res) {

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, status, payment_status, total, delivery_address, created_at,
        order_items (
          id, quantity, unit_price,
          product_variants ( size, color, products ( name, image_url ) )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
    return sendSuccess(res, data)
  }

  if (req.method === 'POST') {
    checkRateLimit(req.user.id, 'order')
    const { delivery_address, phone } = validateBody(req, PlaceOrderSchema)
    const userId = req.user.id

    const { data: cart, error: cartErr } = await supabaseAdmin
      .from('carts')
      .select(`
        id,
        cart_items (
          id, quantity, variant_id,
          product_variants (
            id, size, color, stock_qty, stock_type,
            products ( id, name, is_available, base_price )
          )
        )
      `)
      .eq('user_id', userId).single()

    if (cartErr || !cart || !cart.cart_items?.length) {
      throw new ApiError('CART_EMPTY', 'Your cart is empty.', 400)
    }

    for (const item of cart.cart_items) {
      const product = item.product_variants?.products
      if (!product?.is_available) {
        throw new ApiError('PRODUCT_UNAVAILABLE', `"${product?.name || 'A product'}" is no longer available.`, 400)
      }
    }

    const variantProductMap = {}
    for (const item of cart.cart_items) {
      variantProductMap[item.variant_id] = item.product_variants?.products?.id || null
    }

    const cartItems = cart.cart_items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity }))
    const { total, lineItems } = await calculateOrderTotal(cartItems)

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId, type: 'online', status: 'pending_payment',
        payment_status: 'unpaid', total,
        delivery_address: delivery_address || null,
        phone: phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single()

    if (orderErr) throw new Error(`Failed to create order: ${orderErr.message}`)

    const orderItems = lineItems.map(li => ({
      order_id: order.id, variant_id: li.variant_id,
      product_id: variantProductMap[li.variant_id] || null,
      quantity: li.quantity, unit_price: li.unit_price,
    }))

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems)
    if (itemsErr) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to insert order items: ${itemsErr.message}`)
    }

    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id)

    const { data: fullOrder } = await supabaseAdmin
      .from('orders')
      .select(`
        id, total, delivery_address, phone,
        profiles ( full_name, phone ),
        order_items ( quantity, product_variants ( size, color, products ( name ) ) )
      `)
      .eq('id', order.id).single()

    if (fullOrder) notifyAdmins(buildNewOrderMessage(fullOrder))
    return sendSuccess(res, order, 'Order placed successfully.', 201)
  }

  return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST.' } })
}

export default withMiddleware(handler, { requireAuth: true, rateLimit: 'cart' })
