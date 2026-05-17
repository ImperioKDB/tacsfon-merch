/**
 * lib/upload/storageHelpers.js
 *
 * Wrappers around Supabase Storage for Phase 6 proof uploads.
 */
import { supabaseAdmin } from '../supabase.js'
import path from 'path'
import fs from 'fs'

const PROOF_BUCKET = 'proof-uploads'

/**
 * Uploads a proof file to Supabase Storage.
 *
 * Storage path: proof-uploads/{orderId}/{timestamp}.{ext}
 *
 * @param {string} orderId
 * @param {{ mimetype: string, filepath: string, originalFilename: string }} file
 * @returns {Promise<string>} storage path (not a public URL)
 */
export async function uploadProofFile(orderId, file) {
  const ext       = path.extname(file.originalFilename || '').replace('.', '') || mimeToExt(file.mimetype)
  const timestamp = Date.now()
  const storagePath = `${orderId}/${timestamp}.${ext}`

  const fileBuffer = fs.readFileSync(file.filepath)

  const { error } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType:  file.mimetype,
      upsert:       false,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  return storagePath   // e.g. "order-uuid/1700000000000.jpg"
}

/**
 * Generates a short-lived signed URL for an admin to view a proof file.
 *
 * @param {string} storagePath  - path returned by uploadProofFile()
 * @param {number} expiresIn    - seconds (default: 900 = 15 min)
 * @returns {Promise<string>} signed URL
 */
export async function getProofSignedUrl(storagePath, expiresIn = 900) {
  const { data, error } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Could not generate signed URL: ${error?.message}`)
  }

  return data.signedUrl
}

/** Maps MIME type to file extension as fallback */
function mimeToExt(mime) {
  const map = {
    'image/jpeg':       'jpg',
    'image/png':        'png',
    'image/webp':       'webp',
    'application/pdf':  'pdf',
  }
  return map[mime] || 'bin'
}
