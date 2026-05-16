import { ApiError } from '../errorHandler.js'

const SIGNATURES = [
  { bytes: [0xFF, 0xD8, 0xFF],         offset: 0, mime: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4E, 0x47],   offset: 0, mime: 'image/png'  },
  { bytes: [0x52, 0x49, 0x46, 0x46],   offset: 0, mime: 'image/webp' },
  { bytes: [0x25, 0x50, 0x44, 0x46],   offset: 0, mime: 'application/pdf' },
  { bytes: [0x67, 0x6C, 0x54, 0x46],   offset: 0, mime: 'model/gltf-binary' },
]

export function detectMimeType(buffer) {
  for (const sig of SIGNATURES) {
    const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length)
    if (sig.bytes.every((byte, i) => slice[i] === byte)) return sig.mime
  }
  return null
}

export function assertValidFileMagic(buffer, allowedMimes, fieldName = 'file') {
  if (!buffer || buffer.length < 4) {
    throw new ApiError('INVALID_FILE', `${fieldName}: file is empty or too small.`, 400)
  }

  const detected = detectMimeType(buffer)

  if (!detected || !allowedMimes.includes(detected)) {
    throw new ApiError(
      'INVALID_FILE_TYPE',
      `${fieldName}: file type not allowed. Detected: ${detected || 'unknown'}. ` +
      `Allowed: ${allowedMimes.join(', ')}.`,
      400
    )
  }

  return detected
}
