/**
 * PATCH /api/admin/orders/:id/payment
 *
 * Admin confirms or rejects a payment proof.
 *
 * Body: { payment_status: 'paid' | 'incomplete' }
 *
 * If 'paid':
 *   - order.status        → 'confirmed'
 *   - order.payment_status → 'paid'
 *   - creates notification for student
 *   - triggers receipt generation (async, Phase 9 hook)
 *   - logs to admin_logs
 *
 * If 'incomplete':
 *   - order.payment_status → 'incomplete'
 *   - creates notification for student
 *   - logs to admin_logs
 */

import { withMiddleware }  from '../../../../../lib/middleware/withMiddleware.js'
import { authMiddleware }  from '../../../../../lib/middleware/auth.js'
import { roleGuard }       from '../../../../../lib/middleware/roleGuard.js'
import { sendSuccess }     from '../../../../../lib/responseFormatter.js'
import { ApiError }        from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }   from '../../../../../lib/supabase.js'
import { logAdminAction }  from '../../../../../lib/admin/adminLogger.js'
import { createNotification } from '../../../../../lib/notifications/notificationUtils.js'

const ALLOWED_PAYMENT_STATUSES = ['paid', 'incomplete']

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: orderId } = req.query
  const adminId = req.user.id
  const { payment_status } = req.body

  // 1. Validate input
  if (!ALLOWED_PAYMENT_STATUSES.includes(payment_status)) {
    throw new ApiError(
      'INVALID_PAYMENT_STATUS',
      `payment_status must be one of: ${ALLOWED_PAYMENT_STATUSES.join(', ')}.`,
      400
    )
  }

  // 2. Fetch order (needs user_id for notification, proof_url to confirm it exists)
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, payment_status, proof_url, user_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 3. Order must have proof before admin can confirm/reject
  if (!order.proof_url) {
    throw new ApiError('PROOF_NOT_FOUND', 'Cannot update payment: no proof has been uploaded for this order.', 400)
  }

  // 4. Build update payload
  const updatePayload = {
    payment_status,
    updated_at: new Date().toISOString(),
  }

  let notificationMessage = ''
  const shortId = orderId.slice(0, 8).toUpperCase()

  if (payment_status === 'paid') {
    updatePayload.status = 'confirmed'
    notificationMessage  = `Your order #${shortId} has been confirmed! We're preparing your merch.`
  } else {
    // 'incomplete'
    notificationMessage  = `Your payment for order #${shortId} seems incomplete. Please contact admin on WhatsApp.`
  }

  // 5. Persist
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(`Failed to update order payment: ${updateErr.message}`)
  }

  // 6. Notify student (non-blocking)
  createNotification(order.user_id, notificationMessage).catch((err) => {
    console.error({ event: 'notification_failed', orderId, err: err.message })
  })

  // 7. If paid, trigger receipt generation (Phase 9 hook — async, fire-and-forget)
  if (payment_status === 'paid') {
    triggerReceiptGeneration(orderId).catch((err) => {
      console.error({ event: 'receipt_generation_failed', orderId, err: err.message })
    })
  }

  // 8. Log admin action
  await logAdminAction(adminId, 'UPDATE_PAYMENT_STATUS', {
    order_id:       orderId,
    payment_status,
    new_status:     updated.status,
  })

  return sendSuccess(res, updated, `Payment status updated to '${payment_status}'.`)
}

/**
 * Phase 9 hook — called when payment is confirmed.
 * Generates and stores the PDF receipt. Stubbed here until Phase 9 is built.
 *
 * @param {string} orderId
 */
async function triggerReceiptGeneration(orderId) {
  // Phase 9 will replace this stub with actual PDF generation logic.
  console.log(JSON.stringify({ event: 'receipt_generation_queued', orderId, ts: new Date().toISOString() }))
}

export default withMiddleware(handler, [authMiddleware, roleGuard('admin')])
