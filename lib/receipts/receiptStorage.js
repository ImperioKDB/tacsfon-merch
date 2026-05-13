/**
 * lib/receipts/receiptStorage.js
 *
 * Handles storing and retrieving PDF receipts in Supabase Storage.
 * Bucket: receipts  (private — access via signed URLs only)
 */
import { supabaseAdmin } from '../supabase.js'

const RECEIPT_BUCKET  = 'receipts'
const SIGNED_URL_TTL  = 3600   // 1 hour

/**
 * Uploads a PDF buffer to storage and records it in the receipts table.
 *
 * Storage path: receipts/{orderId}/receipt.pdf
 *
 * @param {string} orderId
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>} storage path
 */
export async function storeReceipt(orderId, pdfBuffer) {
  const storagePath = `${orderId}/receipt.pdf`

  const { error: uploadErr } = await supabaseAdmin.storage
    .from(RECEIPT_BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert:      true,   // overwrite if re-generated
    })

  if (uploadErr) {
    throw new Error(`Receipt upload failed: ${uploadErr.message}`)
  }

  // Record in receipts table
  const { error: dbErr } = await supabaseAdmin
    .from('receipts')
    .upsert({
      order_id:     orderId,
      storage_path: storagePath,
      created_at:   new Date().toISOString(),
    }, { onConflict: 'order_id' })

  if (dbErr) {
    throw new Error(`Receipt DB insert failed: ${dbErr.message}`)
  }

  return storagePath
}

/**
 * Generates a signed URL for a receipt.
 *
 * @param {string} storagePath
 * @param {number} expiresIn   - seconds (default 1 hour)
 * @returns {Promise<string>} signed URL
 */
export async function getReceiptSignedUrl(storagePath, expiresIn = SIGNED_URL_TTL) {
  const { data, error } = await supabaseAdmin.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Could not generate receipt signed URL: ${error?.message}`)
  }

  return data.signedUrl
}

/**
 * Looks up an existing receipt record for an order.
 *
 * @param {string} orderId
 * @returns {Promise<{ storage_path: string } | null>}
 */
export async function findReceipt(orderId) {
  const { data, error } = await supabaseAdmin
    .from('receipts')
    .select('storage_path, created_at')
    .eq('order_id', orderId)
    .single()

  if (error || !data) return null
  return data
}
