/**
 * PATCH /api/admin/orders/:id/status
 *
 * Admin moves an order forward in the lifecycle.
 * Only valid admin transition: confirmed → dispatched
 *
 * Body: { status: 'dispatched' }
 */
import { withMiddleware }        from '../../../../../lib/middleware/withMiddleware.js'
import { authMiddleware }        from '../../../../../lib/middleware/auth.js'
import { roleGuard }             from '../../../../../lib/middleware/roleGuard.js'
import { sendSuccess }           from '../../../../../lib/responseFormatter.js'
import { ApiError }              from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }         from '../../../../../lib/supabase.js'
import { assertValidTransition } from '../../../../../lib/orders/orderUtils.js'
import { logAdminAction }        from '../../../../../lib/admin/adminLogger.js'
import { createNotification }    from '../../../../../lib/notifications/notificationUtils.js'

const ADMIN_ALLOWED_STATUSES = ['dispatched']

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: orderId }       = req.query
  const adminId                = req.user.id
  const { status: newStatus }  = req.body

  // 1. Validate requested status is one admin is allowed to set
  if (!ADMIN_ALLOWED_STATUSES.includes(newStatus)) {
    throw new ApiError(
      'INVALID_STATUS_CHANGE',
      `Admins can only set status to: ${ADMIN_ALLOWED_STATUSES.join(', ')}.`,
      400
    )
  }

  // 2. Fetch current order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 3. Validate transition using single source of truth
  assertValidTransition(order.status, newStatus)

  // 4. Update status
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(`Failed to update order status: ${updateErr.message}`)
  }

  // 5. Notify student (non-blocking)
  const shortId = orderId.slice(0, 8).toUpperCase()
  const message = `Great news! Your order #${shortId} is on its way. Expected within 48 hours.`

  createNotification(order.user_id, message).catch((err) => {
    console.error(JSON.stringify({ event: 'notification_failed', orderId, err: err.message }))
  })

  // 6. Log admin action
  await logAdminAction(adminId, 'UPDATE_ORDER_STATUS', {
    order_id:    orderId,
    from_status: order.status,
    to_status:   newStatus,
  })

  return sendSuccess(res, updated, `Order status updated to '${newStatus}'.`)
}

export default withMiddleware(handler, [authMiddleware, roleGuard('admin')])
