import { withMiddleware }                        from '../../../lib/middleware/withMiddleware.js'
import { supabaseAdmin }                         from '../../../lib/supabase.js'
import { sendSuccess, sendError }                from '../../../lib/responseFormatter.js'
import { assertMethod, validateUUID }            from '../../../lib/validate.js'
import { getOrderWithItems, assertValidTransition } from '../../../lib/orders/orderUtils.js'

/**
 * GET    /api/orders/:id  — get a single order (owner only)
 * DELETE /api/orders/:id  — cancel an order (owner only, pending_payment only)
 */
async function handler(req, res) {
  assertMethod(req, ['GET', 'DELETE'])

  const { id } = req.query
  validateUUID(id, 'order id')

  if (req.method === 'GET')    return getOrder(req, res, id)
  if (req.method === 'DELETE') return cancelOrder(req, res, id)
}

async function getOrder(req, res, orderId) {
  const order = await getOrderWithItems(orderId, req.user.id)

  if (!order) {
    return sendError(res, 'ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  return sendSuccess(res, order)
}

async function cancelOrder(req, res, orderId) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id')
    .eq('id', orderId)
    .eq('user_id', req.user.id)
    .single()

  if (error || !order) {
    return sendError(res, 'ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // Validate the transition (throws INVALID_STATUS_CHANGE if not allowed)
  assertValidTransition(order.status, 'cancelled')

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (updateError) throw updateError

  // Best-effort stock restore for stock-type items
  // FIX: product_variant_id → variant_id (actual FK column in order_items)
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', orderId)

  if (items?.length) {
    for (const item of items) {
      await supabaseAdmin.rpc('increment_stock', {
        p_variant_id: item.variant_id,
        p_quantity:   item.quantity,
      }).catch(() => {})   // non-blocking; RPC is best-effort
    }
  }

  return sendSuccess(res, { id: orderId, status: 'cancelled' }, 'Order cancelled successfully.')
}

export default withMiddleware(handler, { requireAuth: true })
