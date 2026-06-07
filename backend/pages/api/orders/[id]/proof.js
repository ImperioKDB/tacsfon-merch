/**
 * PATCH /api/orders/:id/proof
 *
 * Student submits payment proof (image upload to Supabase Storage).
 * After storing, moves order to payment_submitted and notifies admins
 * via Telegram with full buyer details.
 */
import { withMiddleware }  from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }     from '../../../../lib/responseFormatter.js'
import { ApiError }        from '../../../../lib/errorHandler.js'
import { supabaseAdmin }   from '../../../../lib/supabase.js'
import { assertValidTransition } from '../../../../lib/orders/orderUtils.js'
import { createNotification, NotificationMessages } from '../../../../lib/notifications/notificationUtils.js'
import { buildProofSubmittedMessage } from '../../../../lib/telegram/orderMessage.js'
import { notifyAdmins }    from '../../../../lib/telegram/sendTelegram.js'

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH.' } })
  }

  const { id: orderId } = req.query
  const userId           = req.user.id
  const { proof_url }    = req.body

  if (!proof_url || typeof proof_url !== 'string') {
    throw new ApiError('MISSING_PROOF_URL', 'proof_url is required.', 400)
  }

  // 1. Fetch order with buyer details for Telegram
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select(`
      id, status, user_id, total, delivery_address, phone,
      profiles ( full_name, email, phone ),
      order_items (
        id, quantity, unit_price,
        product_variants ( id, size, color, products ( name ) )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 2. Validate transition
  assertValidTransition(order.status, 'payment_submitted')

  // 3. Store proof URL + move to payment_submitted
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({
      proof_url,
      status:     'payment_submitted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (updateErr) {
    throw new Error(`Failed to update order: ${updateErr.message}`)
  }

  const shortId = orderId.slice(0, 8).toUpperCase()

  // 4. Notify student in-app
  createNotification(userId, NotificationMessages.proofReceived(shortId)).catch(err =>
    console.error(JSON.stringify({ event: 'notification_failed', orderId, err: err.message }))
  )

  // 5. Notify admins via Telegram with full buyer details
  const telegramMsg = buildProofSubmittedMessage({ ...order, ...updated })
  notifyAdmins(telegramMsg).catch(err =>
    console.error(JSON.stringify({ event: 'telegram_failed', orderId, err: err.message }))
  )

  return sendSuccess(res, updated, 'Payment proof submitted successfully.')
}

export default withMiddleware(handler, { requireAuth: true })
