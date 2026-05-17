/**
 * lib/receipts/index.js
 *
 * Orchestrator: fetch order data → generate PDF → store → return signed URL.
 *
 * FIX: existing.storage_path → existing.receipt_url
 *      (aligned with receiptStorage.js fix — DB column is receipt_url)
 */
import { supabaseAdmin }      from '../supabase.js'
import { generateReceiptPDF } from './generateReceipt.js'
import { storeReceipt, getReceiptSignedUrl, findReceipt } from './receiptStorage.js'

export async function buildAndStoreReceipt(orderId) {
  // 1. Fetch full order data for the PDF
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total, delivery_address,
      created_at, payment_status,
      profiles ( full_name, email ),
      order_items (
        id, quantity, unit_price,
        product_variants (
          size, color,
          products ( name )
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    throw new Error(`Order ${orderId} not found for receipt generation.`)
  }

  // 2. Generate PDF buffer
  const pdfBuffer = await generateReceiptPDF(order)

  // 3. Store in Supabase Storage + receipts table
  const storagePath = await storeReceipt(orderId, pdfBuffer)

  // 4. Return signed URL
  return getReceiptSignedUrl(storagePath)
}

/**
 * Returns a signed URL for an existing receipt, or generates one if missing.
 */
export async function getOrCreateReceiptUrl(orderId) {
  const existing = await findReceipt(orderId)

  if (existing) {
    // FIX: existing.storage_path → existing.receipt_url
    return getReceiptSignedUrl(existing.receipt_url)
  }

  return buildAndStoreReceipt(orderId)
}
