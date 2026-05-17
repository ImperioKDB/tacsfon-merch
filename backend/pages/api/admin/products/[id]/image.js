/**
 * POST /api/admin/products/:id/image
 *
 * Uploads a product image and saves the public URL to image_url.
 * Field name: 'image' | Allowed: JPEG, PNG, WebP | Max: 5 MB
 * Storage path: product-assets/images/{product_id}/main.{ext}
 */
import { withMiddleware } from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../../lib/supabase.js'
import { logAdminAction } from '../../../../../lib/admin/adminLogger.js'
import formidable         from 'formidable'
import fs                 from 'fs'

export const config = { api: { bodyParser: false } }

const IMAGE_BUCKET   = 'product-assets'
const MAX_SIZE       = 5 * 1024 * 1024
const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAGIC_BYTES    = { 'image/jpeg': 'ffd8ff', 'image/png': '89504e47' }

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const { id: productId } = req.query
  const adminId = req.user.id

  const { data: product, error: pErr } = await supabaseAdmin
    .from('products').select('id').eq('id', productId).single()

  if (pErr || !product) throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found.', 404)

  const form = formidable({ maxFileSize: MAX_SIZE + 1024 })
  const [, files] = await form.parse(req)
  const imageFile = files?.image?.[0]

  if (!imageFile) throw new ApiError('INVALID_INPUT', 'No file uploaded. Use field name "image".', 400)
  if (imageFile.size > MAX_SIZE) {
    throw new ApiError('FILE_TOO_LARGE', `Image exceeds 5 MB (${(imageFile.size / 1024 / 1024).toFixed(2)} MB).`, 400)
  }

  const mime = (imageFile.mimetype || '').toLowerCase()
  if (!ALLOWED_IMAGES.has(mime)) {
    throw new ApiError('INVALID_FILE_TYPE', `'${mime}' not allowed. Upload JPEG, PNG, or WebP.`, 400)
  }

  const fd  = fs.openSync(imageFile.filepath, 'r')
  const buf = Buffer.alloc(12)
  fs.readSync(fd, buf, 0, 12, 0)
  fs.closeSync(fd)

  if (mime === 'image/webp') {
    if (buf.slice(0, 4).toString('ascii') !== 'RIFF' || buf.slice(8, 12).toString('ascii') !== 'WEBP') {
      throw new ApiError('INVALID_FILE_TYPE', 'File content does not match image/webp.', 400)
    }
  } else {
    if (!buf.slice(0, 4).toString('hex').startsWith(MAGIC_BYTES[mime])) {
      throw new ApiError('INVALID_FILE_TYPE', `File content does not match '${mime}'.`, 400)
    }
  }

  const ext         = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp'
  const storagePath = `images/${productId}/main.${ext}`
  const fileBuffer  = fs.readFileSync(imageFile.filepath)

  for (const oldExt of ['jpg', 'png', 'webp']) {
    await supabaseAdmin.storage.from(IMAGE_BUCKET).remove([`images/${productId}/main.${oldExt}`]).catch(() => {})
  }

  const { error: uploadErr } = await supabaseAdmin.storage
    .from(IMAGE_BUCKET).upload(storagePath, fileBuffer, { contentType: mime, upsert: true })

  if (uploadErr) throw new Error(`Image upload failed: ${uploadErr.message}`)

  const { data: urlData } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath)
  const imageUrl = urlData?.publicUrl || storagePath

  const { error: updateErr } = await supabaseAdmin
    .from('products').update({ image_url: imageUrl, updated_at: new Date().toISOString() }).eq('id', productId)

  if (updateErr) throw new Error(`Failed to update image_url: ${updateErr.message}`)

  fs.unlink(imageFile.filepath, () => {})

  await logAdminAction(adminId, 'UPLOAD_PRODUCT_IMAGE', { product_id: productId, image_url: imageUrl })

  return sendSuccess(res, { product_id: productId, image_url: imageUrl }, 'Product image uploaded successfully.')
}

export default withMiddleware(handler, { requireAdmin: true })
