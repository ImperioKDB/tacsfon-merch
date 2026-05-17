/**
 * GET /api/admin/orders/:id/receipt
 *
 * Admin endpoint — get or regenerate any order's receipt.
 * Also allows forced regeneration via ?regenerate=true
 */
import { withMiddleware }        from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }           from '../../../../../lib/responseFormatter.js'
import { ApiError }              from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }         from '../../../../../lib/supabase.js'
import { getOrCreateReceiptUrl, buildAndStoreReceipt } from '../../../../../lib/receipts/index.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } })
  }

  const { id: orderId } = req.query
  const regenerate       = req.query.regenerate === 'true'

  // 1. Fetch order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  if (order.payment_status !== 'paid') {
    throw new ApiError(
      'PAYMENT_NOT_CONFIRMED',
      'Cannot generate receipt for an unpaid order.',
      400
    )
  }

  // 2. Regenerate or fetch existing
  const signedUrl = regenerate
    ? await buildAndStoreReceipt(orderId)
    : await getOrCreateReceiptUrl(orderId)

  return sendSuccess(res, {
    order_id:    orderId,
    signed_url:  signedUrl,
    expires_in:  3600,
    regenerated: regenerate,
  }, regenerate ? 'Receipt regenerated.' : 'Receipt URL generated.')
}

export default withMiddleware(handler, { requireAdmin: true })