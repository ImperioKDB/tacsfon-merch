/**
 * POST /api/orders/:id/proof — upload payment proof
 * Phase 12: rate limit 'upload' + magic byte validation
 */
import { withMiddleware }       from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }          from '../../../../lib/responseFormatter.js'
import { ApiError }             from '../../../../lib/errorHandler.js'
import { supabaseAdmin }        from '../../../../lib/supabase.js'
import { validateUUID }         from '../../../../lib/validate.js'
import { assertValidFileMagic } from '../../../../lib/middleware/magicBytes.js'
import { uploadProof }          from '../../../../lib/storage/storageHelpers.js'
import { createNotification, NotificationMessages } from '../../../../lib/notifications/notificationUtils.js'

export const config = { api: { bodyParser: false } }

const ALLOWED_PROOF_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE        = 5 * 1024 * 1024

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const { id: orderId } = req.query
  validateUUID(orderId, 'order id')

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id')
    .eq('id', orderId)
    .eq('user_id', req.user.id)
    .single()

  if (orderErr || !order) throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  if (order.status !== 'pending_payment') {
    throw new ApiError('INVALID_STATUS', 'Proof can only be uploaded for orders awaiting payment.', 400)
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const fileBuffer = Buffer.concat(chunks)

  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new ApiError('FILE_TOO_LARGE', 'File must be under 5MB.', 400)
  }

  assertValidFileMagic(fileBuffer, ALLOWED_PROOF_MIMES, 'proof file')

  const proofUrl = await uploadProof(orderId, fileBuffer)

  const { error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({ proof_url: proofUrl, status: 'payment_submitted', updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (updateErr) throw new Error(`Failed to update order proof: ${updateErr.message}`)

  const shortId = orderId.slice(0, 8).toUpperCase()
  createNotification(req.user.id, NotificationMessages.proofReceived(shortId)).catch(() => {})

  return sendSuccess(res, { orderId, proofUrl }, 'Payment proof uploaded successfully.')
}

export default withMiddleware(handler, { requireAuth: true, rateLimit: 'upload' })
