/**
 * lib/receipts/receiptStorage.js
 *
 * Handles storing and retrieving PDF receipts in Supabase Storage.
 * Bucket: receipts  (private — access via signed URLs only)
 *
 * receipts table columns: id, order_id, receipt_url, created_at
 * FIX: storage_path → receipt_url throughout (storage_path column does not exist)
 */
import { supabaseAdmin } from '../supabase.js'

const RECEIPT_BUCKET = 'receipts'
const SIGNED_URL_TTL = 3600   // 1 hour

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

  // FIX: storage_path → receipt_url (actual column name in receipts table)
  const { error: dbErr } = await supabaseAdmin
    .from('receipts')
    .upsert({
      order_id:    orderId,
      receipt_url: storagePath,
      created_at:  new Date().toISOString(),
    }, { onConflict: 'order_id' })

  if (dbErr) {
    throw new Error(`Receipt DB insert failed: ${dbErr.message}`)
  }

  return storagePath
}

/**
 * Generates a signed URL for a receipt file in storage.
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
 * @returns {Promise<{ receipt_url: string } | null>}
 */
export async function findReceipt(orderId) {
  // FIX: storage_path → receipt_url (actual column name in receipts table)
  const { data, error } = await supabaseAdmin
    .from('receipts')
    .select('receipt_url, created_at')
    .eq('order_id', orderId)
    .single()

  if (error || !data) return null
  return data
}
