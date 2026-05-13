/**
 * lib/receipts/index.js
 *
 * Orchestrator: fetch order data → generate PDF → store → return signed URL.
 * Called both automatically (Phase 6 payment confirmed) and on-demand (GET receipt).
 *
 * @param {string} orderId
 * @returns {Promise<string>} signed URL (1 hour expiry)
 */
import { supabaseAdmin }      from '../supabase.js'
import { generateReceiptPDF } from './generateReceipt.js'
import { storeReceipt, getReceiptSignedUrl, findReceipt } from './receiptStorage.js'

export async function buildAndStoreReceipt(orderId) {
  // 1. Fetch full order data needed for the PDF
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total_amount, delivery_method, delivery_address,
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
 *
 * @param {string} orderId
 * @returns {Promise<string>} signed URL
 */
export async function getOrCreateReceiptUrl(orderId) {
  const existing = await findReceipt(orderId)

  if (existing) {
    // Receipt already exists — just return a fresh signed URL
    return getReceiptSignedUrl(existing.storage_path)
  }

  // Receipt missing — generate it now (on-demand fallback)
  return buildAndStoreReceipt(orderId)
}
