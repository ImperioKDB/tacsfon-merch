/**
 * GET /api/admin/orders/:id/proof
 *
 * Returns a 15-minute signed URL for the order's proof file.
 * Admin-only.
 */

import { withMiddleware }    from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }       from '../../../../../lib/responseFormatter.js'
import { ApiError }          from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }     from '../../../../../lib/supabase.js'
import { getProofSignedUrl } from '../../../../../lib/upload/storageHelpers.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } })
  }

  const { id: orderId } = req.query

  // 1. Fetch order
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, proof_url, status')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 2. Proof must exist
  if (!order.proof_url) {
    throw new ApiError('PROOF_NOT_FOUND', 'No payment proof has been uploaded for this order yet.', 404)
  }

  // 3. Generate signed URL (15 min = 900 s)
  const signedUrl = await getProofSignedUrl(order.proof_url, 900)

  return sendSuccess(res, {
    order_id:    orderId,
    signed_url:  signedUrl,
    expires_in:  900,
    proof_path:  order.proof_url,
  }, 'Signed URL generated. Valid for 15 minutes.')
}

export default withMiddleware(handler, { requireAdmin: true })