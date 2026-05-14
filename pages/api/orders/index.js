/**
 * /api/orders
 *
 * POST — Place a new order from cart (Phase 5 + Phase 10 Telegram)
 * GET  — List current user's orders (Phase 5)
 */
import { withMiddleware }     from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess }        from '../../../lib/responseFormatter.js'
import { ApiError }           from '../../../lib/errorHandler.js'
import { supabaseAdmin }      from '../../../lib/supabase.js'
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js'
import { notifyAdmins }       from '../../../lib/telegram/sendTelegram.js'
import { buildNewOrderMessage } from '../../../lib/telegram/orderMessage.js'

async function handler(req, res) {
  // ── GET /api/orders ───────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, status, payment_status, total_amount,
        delivery_method, delivery_address, created_at,
        order_items (
          id, quantity, unit_price,
          product_variants (
            size, color,
            products ( name, image_url )
          )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
    return sendSuccess(res, data)
  }

  // ── POST /api/orders ──────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const userId = req.user.id
    const { delivery_method, delivery_address, phone, notes } = req.body

    // 1. Fetch cart items
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
      .eq('user_id', userId)
      .single()

    if (cartErr || !cart || !cart.cart_items?.length) {
      throw new ApiError('CART_EMPTY', 'Your cart is empty.', 400)
    }

    // 2. Validate all products are still available
    for (const item of cart.cart_items) {
      const product = item.product_variants?.products
      if (!product?.is_available) {
        throw new ApiError('PRODUCT_UNAVAILABLE', `"${product?.name || 'A product'}" is no longer available.`, 400)
      }
    }

    // 3. Recalculate total server-side
    const cartItems = cart.cart_items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity }))
    const { total, lineItems } = await calculateOrderTotal(cartItems)

    // 4. Create order (transaction: order + order_items + clear cart)
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id:          userId,
        status:           'pending_payment',
        payment_status:   'unpaid',
        total_amount:     total,
        delivery_method:  delivery_method || 'delivery',
        delivery_address: delivery_address || null,
        phone:            phone || null,
        notes:            notes || null,
        created_at:       new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      })
      .select()
      .single()

    if (orderErr) throw new Error(`Failed to create order: ${orderErr.message}`)

    // 5. Insert order items
    const orderItems = lineItems.map(li => ({
      order_id:           order.id,
      product_variant_id: li.variant_id,
      quantity:           li.quantity,
      unit_price:         li.unit_price,
    }))

    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsErr) {
      // Roll back order row
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to insert order items: ${itemsErr.message}`)
    }

    // 6. Clear cart
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id)

    // 7. Fetch full order for Telegram message
    const { data: fullOrder } = await supabaseAdmin
      .from('orders')
      .select(`
        id, total_amount, delivery_method, delivery_address, phone,
        profiles ( full_name, phone ),
        order_items (
          quantity,
          product_variants (
            size, color,
            products ( name )
          )
        )
      `)
      .eq('id', order.id)
      .single()

    // 8. Notify admins via Telegram (async, non-blocking)
    if (fullOrder) {
      const message = buildNewOrderMessage(fullOrder)
      notifyAdmins(message)
    }

    return sendSuccess(res, order, 'Order placed successfully.', 201)
  }

  return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST.' } })
}

export default withMiddleware(handler, { requireAuth: true })