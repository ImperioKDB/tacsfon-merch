
import { supabaseAdmin } from '../supabase.js'
const RECEIPT_BUCKET = 'receipts'
const SIGNED_URL_TTL = 604800; // AUDIT #20: 7 Days in seconds

export async function storeReceipt(orderId, pdfBuffer) {
  const storagePath = `${orderId}/receipt.pdf`;
  const { error: uploadErr } = await supabaseAdmin.storage
    .from(RECEIPT_BUCKET)
    .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

  const { error: dbErr } = await supabaseAdmin.from('receipts').upsert({
      order_id: orderId,
      receipt_url: storagePath,
      created_at: new Date().toISOString(),
    }, { onConflict: 'order_id' });

  if (dbErr) throw new Error(`DB recording failed: ${dbErr.message}`);
  return storagePath;
}

export async function getReceiptSignedUrl(storagePath, expiresIn = SIGNED_URL_TTL) {
  const { data, error } = await supabaseAdmin.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) throw new Error("Could not generate URL");
  return data.signedUrl;
}

export async function findReceipt(orderId) {
  const { data, error } = await supabaseAdmin.from('receipts').select('receipt_url').eq('order_id', orderId).single();
  if (error || !data) return null;
  return data;
}
