/**
 * GET /api/orders/:id/receipt
 *
 * Returns a signed URL for the order's PDF receipt.
 * - Student can only get their own receipt
 * - Admin can get any receipt
 * - Payment must be confirmed (payment_status = 'paid')
 * - If receipt not yet generated, generates it on demand
 */
import { withMiddleware }        from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }           from '../../../../lib/responseFormatter.js'
import { ApiError }              from '../../../../lib/errorHandler.js'
import { supabaseAdmin }         from '../../../../lib/supabase.js'
import { getOrCreateReceiptUrl } from '../../../../lib/receipts/index.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } })
  }

  const { id: orderId } = req.query
  const userId           = req.user.id
  const isAdmin          = req.user.role === 'admin'

  // 1. Fetch order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, payment_status')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 2. Students can only access their own receipt
  if (!isAdmin && order.user_id !== userId) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 3. Payment must be confirmed
  if (order.payment_status !== 'paid') {
    throw new ApiError(
      'PAYMENT_NOT_CONFIRMED',
      'Receipt is not available until payment has been confirmed.',
      400
    )
  }

  // 4. Get or generate receipt URL
  const signedUrl = await getOrCreateReceiptUrl(orderId)

  return sendSuccess(res, {
    order_id:   orderId,
    signed_url: signedUrl,
    expires_in: 3600,
  }, 'Receipt URL generated. Valid for 1 hour.')
}

export default withMiddleware(handler, { requireAuth: true })