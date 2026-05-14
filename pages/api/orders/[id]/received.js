/**
 * PATCH /api/orders/:id/received
 *
 * Student marks their own dispatched order as received.
 * Valid transition: dispatched → received
 */
import { withMiddleware }        from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }           from '../../../../lib/responseFormatter.js'
import { ApiError }              from '../../../../lib/errorHandler.js'
import { supabaseAdmin }         from '../../../../lib/supabase.js'
import { assertValidTransition } from '../../../../lib/orders/orderUtils.js'

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: orderId } = req.query
  const userId           = req.user.id

  // 1. Fetch order — must belong to this student
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order || order.user_id !== userId) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 2. Validate transition
  assertValidTransition(order.status, 'received')

  // 3. Update
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({ status: 'received', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(`Failed to mark order as received: ${updateErr.message}`)
  }

  return sendSuccess(res, updated, 'Order marked as received. Thank you!')
}

export default withMiddleware(handler, { requireAuth: true })