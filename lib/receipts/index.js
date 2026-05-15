/**
 * lib/receipts/index.js
 *
 * Orchestrator: fetch order data → generate PDF → store → return signed URL.
 *
 * FIX: total_amount → total | delivery_method removed from select
 */
import { supabaseAdmin }      from '../supabase.js'
import { generateReceiptPDF } from './generateReceipt.js'
import { storeReceipt, getReceiptSignedUrl, findReceipt } from './receiptStorage.js'

export async function buildAndStoreReceipt(orderId) {
  // 1. Fetch full order data for the PDF
  // FIX: total_amount → total | delivery_method removed
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
    return getReceiptSignedUrl(existing.storage_path)
  }

  return buildAndStoreReceipt(orderId)
}
