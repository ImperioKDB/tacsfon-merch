/**
 * fileMagic — Magic-byte file type validation
 *
 * Verifies that a file's binary content actually matches its declared MIME type.
 * This prevents attackers from uploading a malicious payload (e.g. an .exe)
 * with a trusted extension (e.g. .jpg).
 *
 * Supported MIME types:
 *   image/jpeg         — FF D8 FF
 *   image/png          — 89 50 4E 47 0D 0A 1A 0A
 *   image/webp         — 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
 *   model/gltf-binary  — 67 6C 54 46  (glTF binary magic)
 *   application/pdf    — 25 50 44 46  (%PDF)
 *
 * Usage (in a file-upload route):
 *
 *   const formData = await req.formData()
 *   const file     = formData.get('image') as File
 *
 *   const result = await validateFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024)
 *   if (!result.ok) return NextResponse.json(errorResponse('INVALID_FILE', result.reason), { status: 400 })
 *
 *   // result.buffer is already read — pass directly to Supabase Storage
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type SupportedMime =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'model/gltf-binary'
  | 'application/pdf'

export interface MagicCheckResult {
  valid:        boolean
  detectedType: SupportedMime | 'unknown'
}

export type FileValidationResult =
  | { ok: true;  buffer: ArrayBuffer }
  | { ok: false; reason: string }

// ── Magic byte detection ─────────────────────────────────────────────────────

function matchAt(buf: Uint8Array, offset: number, pattern: number[]): boolean {
  if (buf.length < offset + pattern.length) return false
  return pattern.every((byte, i) => buf[offset + i] === byte)
}

function detectType(buf: Uint8Array): SupportedMime | 'unknown' {
  if (buf.length < 12) return 'unknown'

  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return 'image/jpeg'
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (matchAt(buf, 0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return 'image/png'
  }

  // WebP: RIFF????WEBP  (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
  if (
    matchAt(buf, 0, [0x52, 0x49, 0x46, 0x46]) &&
    matchAt(buf, 8, [0x57, 0x45, 0x42, 0x50])
  ) {
    return 'image/webp'
  }

  // GLB (glTF Binary): 67 6C 54 46  →  "glTF"
  if (matchAt(buf, 0, [0x67, 0x6C, 0x54, 0x46])) {
    return 'model/gltf-binary'
  }

  // PDF: 25 50 44 46  →  "%PDF"
  if (matchAt(buf, 0, [0x25, 0x50, 0x44, 0x46])) {
    return 'application/pdf'
  }

  return 'unknown'
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Low-level: check an already-read ArrayBuffer against a declared MIME type.
 */
export function checkFileMagic(
  buffer:      ArrayBuffer,
  declaredMime: string
): MagicCheckResult {
  const bytes        = new Uint8Array(buffer)
  const detectedType = detectType(bytes)

  return {
    valid:        detectedType === declaredMime,
    detectedType,
  }
}

/**
 * High-level: validate a File from FormData.
 *
 * Checks (in order):
 *   1. File size <= maxBytes
 *   2. Declared MIME type is in allowedMimes
 *   3. Actual magic bytes match declared MIME type
 *
 * Returns the ArrayBuffer so the caller doesn't have to read it again.
 *
 * @param file         - File object from formData.get(...)
 * @param allowedMimes - Whitelist of MIME types for this endpoint
 * @param maxBytes     - Hard size cap in bytes (e.g. 5 * 1024 * 1024 for 5 MB)
 */
export async function validateFile(
  file:         File,
  allowedMimes: SupportedMime[],
  maxBytes:     number
): Promise<FileValidationResult> {
  // 1. Size check
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / 1_048_576).toFixed(0)
    return {
      ok:     false,
      reason: `File size (${(file.size / 1_048_576).toFixed(1)} MB) exceeds the ${maxMB} MB limit.`,
    }
  }

  // 2. Declared MIME whitelist
  if (!allowedMimes.includes(file.type as SupportedMime)) {
    return {
      ok:     false,
      reason: `File type '${file.type}' is not allowed. Accepted types: ${allowedMimes.join(', ')}.`,
    }
  }

  // 3. Magic byte check — read the buffer once and return it
  const buffer = await file.arrayBuffer()
  const { valid, detectedType } = checkFileMagic(buffer, file.type)

  if (!valid) {
    return {
      ok:     false,
      reason: `File content does not match the declared type '${file.type}'. Detected: '${detectedType}'.`,
    }
  }

  return { ok: true, buffer }
}
