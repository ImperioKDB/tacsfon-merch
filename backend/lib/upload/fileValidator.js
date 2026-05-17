/**
 * lib/upload/fileValidator.js
 *
 * Validates uploaded proof files before they reach Supabase Storage.
 *
 * Rules (from Phase 6 spec):
 *   - Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
 *   - Max size: 5 MB
 *   - Magic-bytes check: reject files whose first bytes don't match claimed type
 */

const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5 MB

/** MIME → expected hex magic bytes (first 4 bytes) */
const MAGIC_BYTES = {
  'image/jpeg':       'ffd8ff',
  'image/png':        '89504e47',
  'image/webp':       '52494646',   // "RIFF" — WebP container
  'application/pdf':  '25504446',   // "%PDF"
}

const ALLOWED_MIMES = new Set(Object.keys(MAGIC_BYTES))

/**
 * Validates a parsed multipart file object (from formidable).
 *
 * @param {{ mimetype: string, size: number, filepath: string }} file
 * @param {Buffer} buffer  - first 8 bytes of file content
 * @throws {ApiError}
 */
export function validateProofFile(file, buffer) {
  const { ApiError } = require('../errorHandler.js')

  // 1. Size check
  if (file.size > MAX_SIZE_BYTES) {
    throw new ApiError(
      'FILE_TOO_LARGE',
      `File exceeds maximum allowed size of 5 MB. Received ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
      400
    )
  }

  // 2. MIME type allowlist
  const mime = (file.mimetype || '').toLowerCase()
  if (!ALLOWED_MIMES.has(mime)) {
    throw new ApiError(
      'INVALID_FILE_TYPE',
      `File type '${mime}' is not allowed. Upload a JPEG, PNG, WebP image, or PDF.`,
      400
    )
  }

  // 3. Magic-bytes check (guards against renamed executables)
  const magic = buffer.slice(0, 4).toString('hex')
  const expected = MAGIC_BYTES[mime]

  // WebP: magic is "RIFF????WEBP" — check first 4 bytes + bytes 8-11
  if (mime === 'image/webp') {
    const riff = buffer.slice(0, 4).toString('ascii')   // "RIFF"
    const webp = buffer.slice(8, 12).toString('ascii')  // "WEBP"
    if (riff !== 'RIFF' || webp !== 'WEBP') {
      throw new ApiError(
        'INVALID_FILE_TYPE',
        'File content does not match the declared image/webp type.',
        400
      )
    }
    return  // valid WebP
  }

  if (!magic.startsWith(expected)) {
    throw new ApiError(
      'INVALID_FILE_TYPE',
      `File content does not match the declared type '${mime}'. Upload a genuine image or PDF.`,
      400
    )
  }
}
