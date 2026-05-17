/**
 * POST /api/orders/:id/proof — upload payment proof
 *
 * Phase 12: rate limit 'upload' + magic byte validation
 *
 * Reads raw request bytes (bodyParser: false) so we can:
 *   1. Check magic bytes before touching storage
 *   2. Upload the validated buffer directly via supabaseAdmin
 *
 * Storage path: proof-uploads/{orderId}/{timestamp}.{ext}
 */
import { withMiddleware }       from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }          from '../../../../lib/responseFormatter.js'
import { ApiError }             from '../../../../lib/errorHandler.js'
import { supabaseAdmin }        from '../../../../lib/supabase.js'
import { validateUUID }         from '../../../../lib/validate.js'
import { assertValidFileMagic } from '../../../../lib/middleware/magicBytes.js'
import { createNotification, NotificationMessages } from '../../../../lib/notifications/notificationUtils.js'

export const config = { api: { bodyParser: false } }

const PROOF_BUCKET      = 'proof-uploads'
const MAX_FILE_SIZE     = 5 * 1024 * 1024   // 5 MB
const ALLOWED_MIMES     = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const MIME_TO_EXT = {
  'image/jpeg':      'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'application/pdf': 'pdf',
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' },
    })
  }

  const { id: orderId } = req.query
  validateUUID(orderId, 'order id')

  // 1. Verify order belongs to user and is awaiting payment
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id')
    .eq('id', orderId)
    .eq('user_id', req.user.id)
    .single()

  if (orderErr || !order) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  if (order.status !== 'pending_payment') {
    throw new ApiError(
      'INVALID_STATUS',
      'Proof can only be uploaded for orders awaiting payment.',
      400
    )
  }

  // 2. Read raw body bytes
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const fileBuffer = Buffer.concat(chunks)

  if (fileBuffer.length === 0) {
    throw new ApiError('INVALID_FILE', 'No file received.', 400)
  }

  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new ApiError('FILE_TOO_LARGE', 'File must be under 5MB.', 400)
  }

  // 3. Magic byte check — validates actual file type, not just claimed MIME
  const detectedMime = assertValidFileMagic(fileBuffer, ALLOWED_MIMES, 'proof file')

  // 4. Upload buffer directly to Supabase Storage
  const ext         = MIME_TO_EXT[detectedMime] || 'bin'
  const storagePath = `${orderId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: detectedMime,
      upsert:      false,
    })

  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`)
  }

  // 5. Update order: set proof_url and advance status
  const { error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({
      proof_url:  storagePath,
      status:     'payment_submitted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateErr) {
    // Best-effort cleanup of uploaded file
    await supabaseAdmin.storage.from(PROOF_BUCKET).remove([storagePath]).catch(() => {})
    throw new Error(`Failed to update order after proof upload: ${updateErr.message}`)
  }

  // 6. Notify student (non-blocking)
  const shortId = orderId.slice(0, 8).toUpperCase()
  createNotification(
    req.user.id,
    NotificationMessages.proofReceived(shortId)
  ).catch(() => {})

  return sendSuccess(res, { orderId, proofUrl: storagePath }, 'Payment proof uploaded successfully.')
}

export default withMiddleware(handler, { requireAuth: true, rateLimit: 'upload' })
