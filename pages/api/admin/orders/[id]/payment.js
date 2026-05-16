/**
 * PATCH /api/admin/orders/:id/payment
 * Admin confirms or rejects payment proof.
 *
 * Phase 12: rate limit 'admin' + zod validation
 */
import { withMiddleware }        from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }           from '../../../../../lib/responseFormatter.js'
import { ApiError }              from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }         from '../../../../../lib/supabase.js'
import { assertValidTransition } from '../../../../../lib/orders/orderUtils.js'
import { logAdminAction }        from '../../../../../lib/admin/adminLogger.js'
import { validateBody }          from '../../../../../lib/middleware/validate.js'
import { UpdatePaymentStatusSchema } from '../../../../../lib/schemas/adminSchemas.js'
import { createNotification, NotificationMessages } from '../../../../../lib/notifications/notificationUtils.js'
import { buildAndStoreReceipt }  from '../../../../../lib/receipts/index.js'

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: orderId } = req.query
  const adminId = req.user.id

  // Phase 12: zod validation
  const { payment_status } = validateBody(req, UpdatePaymentStatusSchema)

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, payment_status, proof_url, user_id')
    .eq('id', orderId).single()

  if (orderErr || !order) throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  if (!order.proof_url) {
    throw new ApiError('PROOF_NOT_FOUND', 'No proof uploaded for this order.', 400)
  }

  if (payment_status === 'paid') {
    assertValidTransition(order.status, 'confirmed')
  }

  const updatePayload = { payment_status, updated_at: new Date().toISOString() }
  const shortId = orderId.slice(0, 8).toUpperCase()

  if (payment_status === 'paid') updatePayload.status = 'confirmed'

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders').update(updatePayload).eq('id', orderId).select().single()

  if (updateErr) throw new Error(`Failed to update order payment: ${updateErr.message}`)

  const message = payment_status === 'paid'
    ? NotificationMessages.orderConfirmed(shortId)
    : NotificationMessages.paymentIncomplete(shortId)

  createNotification(order.user_id, message).catch((err) => {
    console.error(JSON.stringify({ event: 'notification_failed', orderId, err: err.message }))
  })

  if (payment_status === 'paid') {
    buildAndStoreReceipt(orderId).catch((err) => {
      console.error(JSON.stringify({ event: 'receipt_generation_failed', orderId, err: err.message }))
    })
  }

  await logAdminAction(adminId, 'UPDATE_PAYMENT_STATUS', {
    order_id: orderId, payment_status, new_status: updated.status,
  })

  return sendSuccess(res, updated, `Payment status updated to '${payment_status}'.`)
}

export default withMiddleware(handler, { requireAdmin: true, rateLimit: 'admin' })
