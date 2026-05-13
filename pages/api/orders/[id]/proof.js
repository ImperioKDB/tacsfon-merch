/**
 * POST /api/orders/:id/proof
 *
 * Student uploads bank transfer proof for an order.
 *
 * - Order must belong to the authenticated user
 * - Order status must be 'pending_payment'
 * - File: image/jpeg | image/png | image/webp | application/pdf, max 5 MB
 * - Stores in Supabase Storage: proof-uploads/{orderId}/{timestamp}.{ext}
 * - Updates order row: proof_url = storage path
 */

import { withMiddleware }    from '../../../../lib/middleware/withMiddleware.js'
import { authMiddleware }    from '../../../../lib/middleware/auth.js'
import { sendSuccess }       from '../../../../lib/responseFormatter.js'
import { ApiError }          from '../../../../lib/errorHandler.js'
import { supabaseAdmin }     from '../../../../lib/supabase.js'
import { validateProofFile } from '../../../../lib/upload/fileValidator.js'
import { uploadProofFile }   from '../../../../lib/upload/storageHelpers.js'
import formidable            from 'formidable'
import fs                    from 'fs'

// Disable Next.js default body parser — formidable handles multipart
export const config = { api: { bodyParser: false } }

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const { id: orderId } = req.query
  const userId = req.user.id

  // 1. Verify order exists and belongs to this user
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id, status, proof_url, user_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order || order.user_id !== userId) {
    throw new ApiError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  // 2. Must be pending_payment
  if (order.status !== 'pending_payment') {
    throw new ApiError(
      'ORDER_NOT_PENDING',
      `Cannot upload proof for an order with status '${order.status}'. Order must be pending payment.`,
      400
    )
  }

  // 3. Guard: don't allow re-upload (spec says proof_url tracks this)
  if (order.proof_url) {
    throw new ApiError(
      'PROOF_ALREADY_UPLOADED',
      'Payment proof has already been submitted for this order. Contact admin if you need to replace it.',
      409
    )
  }

  // 4. Parse multipart form
  const form = formidable({ maxFileSize: 6 * 1024 * 1024 })  // slightly above limit so we can give a good error
  const [, files] = await form.parse(req)

  const proofFile = files?.proof?.[0]
  if (!proofFile) {
    throw new ApiError('INVALID_INPUT', 'No file uploaded. Send the file in a field named "proof".', 400)
  }

  // 5. Read first 12 bytes for magic-byte check
  const fd = fs.openSync(proofFile.filepath, 'r')
  const headerBuf = Buffer.alloc(12)
  fs.readSync(fd, headerBuf, 0, 12, 0)
  fs.closeSync(fd)

  // 6. Validate (size, MIME, magic bytes)
  validateProofFile(proofFile, headerBuf)

  // 7. Upload to Supabase Storage
  const storagePath = await uploadProofFile(orderId, proofFile)

  // 8. Update order row
  const { error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({
      proof_url:  storagePath,
      status:     'payment_submitted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateErr) {
    // Clean up the uploaded file on DB failure
    await supabaseAdmin.storage.from('proof-uploads').remove([storagePath]).catch(() => {})
    throw new Error(`Failed to update order: ${updateErr.message}`)
  }

  // 9. Clean up temp file
  fs.unlink(proofFile.filepath, () => {})

  return sendSuccess(res, { proof_url: storagePath, order_id: orderId, status: 'payment_submitted' },
    'Payment proof uploaded successfully. An admin will verify your payment shortly.', 200)
}

export default withMiddleware(handler, [authMiddleware])
