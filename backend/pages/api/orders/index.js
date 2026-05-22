import { withMiddleware }       from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess }          from '../../../lib/responseFormatter.js'
import { ApiError }             from '../../../lib/errorHandler.js'
import { supabaseAdmin }        from '../../../lib/supabase.js'
import { calculateOrderTotal }  from '../../../lib/orders/orderUtils.js'
import { validateBody }         from '../../../lib/middleware/validate.js'
import { PlaceOrderSchema }     from '../../../lib/schemas/orderSchemas.js'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { data } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('user_id', req.user.id).order('created_at', { ascending: false })
    return sendSuccess(res, data)
  }
  if (req.method === 'POST') {
    const { delivery_address, phone } = validateBody(req, PlaceOrderSchema)
    const userId = req.user.id
    const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single()
    if (!cart?.cart_items?.length) throw new ApiError('CART_EMPTY', 'Cart empty', 400)
    const { total, lineItems } = await calculateOrderTotal(cart.cart_items)
    const { data: order } = await supabaseAdmin.from('orders').insert({
      user_id: userId, type: 'online', status: 'pending', payment_status: 'unpaid', total, delivery_address, phone
    }).select().single()
    const orderItems = lineItems.map(li => ({ ...li, order_id: order.id }))
    await supabaseAdmin.from('order_items').insert(orderItems)
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id)
    return sendSuccess(res, order, 'Placed', 201)
  }
}
export default withMiddleware(handler, { requireAuth: true, rateLimit: 'order' })