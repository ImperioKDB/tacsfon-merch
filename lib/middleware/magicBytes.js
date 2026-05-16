/**
 * lib/middleware/magicBytes.js
 *
 * Validates file uploads by checking their actual magic bytes (file signature),
 * not just the MIME type or file extension the client reports.
 * Catches misnamed files (e.g. a .jpg that is actually a .exe).
 *
 * Used in: proof upload, product image upload, product model upload
 */
import { ApiError } from '../errorHandler.js'

/**
 * Known file magic byte signatures.
 * Format: { signature: Buffer, mimeType: string, offset: number }
 */
const SIGNATURES = [
  // JPEG
  { bytes: [0xFF, 0xD8, 0xFF],               offset: 0, mime: 'image/jpeg' },
  // PNG
  { bytes: [0x89, 0x50, 0x4E, 0x47],         offset: 0, mime: 'image/png' },
  // WebP (RIFF....WEBP)
  { bytes: [0x52, 0x49, 0x46, 0x46],         offset: 0, mime: 'image/webp' },
  // PDF
  { bytes: [0x25, 0x50, 0x44, 0x46],         offset: 0, mime: 'application/pdf' },
  // GLB (3D model — binary glTF)
  { bytes: [0x67, 0x6C, 0x54, 0x46],         offset: 0, mime: 'model/gltf-binary' },
]

/**
 * Detects the real MIME type of a file buffer by inspecting its magic bytes.
 *
 * @param {Buffer} buffer - raw file bytes
 * @returns {string|null} detected MIME type, or null if unrecognised
 */
export function detectMimeType(buffer) {
  for (const sig of SIGNATURES) {
    const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length)
    if (sig.bytes.every((byte, i) => slice[i] === byte)) {
      return sig.mime
    }
  }
  return null
}

/**
 * Validates that a file buffer matches one of the allowed MIME types
 * by inspecting its magic bytes. Throws 400 if the file is not what it claims.
 *
 * @param {Buffer} buffer       - raw file bytes
 * @param {string[]} allowedMimes - e.g. ['image/jpeg', 'image/png']
 * @param {string} fieldName    - used in error messages
 */
export function assertValidFileMagic(buffer, allowedMimes, fieldName = 'file') {
  if (!buffer || buffer.length < 4) {
    throw new ApiError('INVALID_FILE', `${fieldName}: file is empty or too small.`, 400)
  }

  const detected = detectMimeType(buffer)

  if (!detected || !allowedMimes.includes(detected)) {
    throw new ApiError(
      'INVALID_FILE_TYPE',
      `${fieldName}: file type is not allowed. Detected: ${detected || 'unknown'}. ` +
      `Allowed: ${allowedMimes.join(', ')}.`,
      400
    )
  }

  return detected
}
