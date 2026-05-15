/**
 * PATCH /api/admin/orders/:id/payment
 *
 * Admin confirms or rejects a payment proof.
 * Body: { payment_status: 'paid' | 'incomplete' }
 *
 * If 'paid':
 *   - Validates order is in 'payment_submitted' state (transition guard)
 *   - order.status        → 'confirmed'
 *   - order.payment_status → 'paid'
 *   - creates notification for student
 *   - triggers receipt generation (async)
 *   - logs to admin_logs
 *
 * If 'incomplete':
 *   - order.payment_status → 'incomplete'
 *   - creates notification for student
 *   - logs to admin_logs
 *
 * FIX: added assertValidTransition() guard to prevent double-confirming orders
 *      that are already confirmed, dispatched, or received.
 */
import { withMiddleware }        from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }           from '../../../../../lib/responseFormatter.js'
import { ApiError }              from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }         from '../../../../../lib/supabase.js'
import { assertValidTransition } from '../../../../../lib/orders/orderUtils.js'
import { logAdminAction }        from '../../../../../lib/admin/adminLogger.js'
import { createNotification, NotificationMessages } from '../../../../../lib/notifications/notificationUtils.js'
import { buildAndStoreReceipt }  from '../../../../../lib/receipts/index.js'

const ALLOWED_PAYMENT_STATUSES = ['paid', 'incomplete']

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: orderId }   = req.query
  const adminId            = req.user.id
  const { payment_status } = req.body

  // 1. Validate input
  if (!ALLOWED_PAYMENT_STATUSES.includes(payment_status)) {
    throw new ApiError(
      'INVALID_PAYMENT_STATUS',
      `payment_status must be one of: ${ALLOWED_PAYMENT_STATUSES.join(', ')}.`,
      400
    )
  }

  // 2. Fetch order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, payment_status, proof_url, user_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  if (!order.proof_url) {
    throw new ApiError('PROOF_NOT_FOUND', 'Cannot update payment: no proof uploaded for this order.', 400)
  }

  // FIX: guard against double-confirming an order that has already moved past payment_submitted.
  // assertValidTransition throws INVALID_STATUS_CHANGE (400) if the transition is not allowed.
  // payment_submitted → confirmed is valid; confirmed/dispatched/received → confirmed is not.
  if (payment_status === 'paid') {
    assertValidTransition(order.status, 'confirmed')
  }

  // 3. Build update payload
  const updatePayload = { payment_status, updated_at: new Date().toISOString() }
  const shortId       = orderId.slice(0, 8).toUpperCase()

  if (payment_status === 'paid') {
    updatePayload.status = 'confirmed'
  }

  // 4. Persist
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select()
    .single()

  if (updateErr) throw new Error(`Failed to update order payment: ${updateErr.message}`)

  // 5. Notify student (non-blocking)
  const message = payment_status === 'paid'
    ? NotificationMessages.orderConfirmed(shortId)
    : NotificationMessages.paymentIncomplete(shortId)

  createNotification(order.user_id, message).catch((err) => {
    console.error(JSON.stringify({ event: 'notification_failed', orderId, err: err.message }))
  })

  // 6. Generate receipt if paid (non-blocking)
  if (payment_status === 'paid') {
    buildAndStoreReceipt(orderId).catch((err) => {
      console.error(JSON.stringify({ event: 'receipt_generation_failed', orderId, err: err.message }))
    })
  }

  // 7. Log admin action
  await logAdminAction(adminId, 'UPDATE_PAYMENT_STATUS', {
    order_id:       orderId,
    payment_status,
    new_status:     updated.status,
  })

  return sendSuccess(res, updated, `Payment status updated to '${payment_status}'.`)
}

export default withMiddleware(handler, { requireAdmin: true })
