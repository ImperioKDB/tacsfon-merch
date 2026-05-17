/**
 * POST /api/admin/products/:id/model
 *
 * Uploads a 3D model (.glb) for a product — max 50 MB.
 * Field name: 'model'
 * Storage path: product-assets/models/{product_id}/model.glb
 */
import { withMiddleware } from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../../lib/supabase.js'
import { logAdminAction } from '../../../../../lib/admin/adminLogger.js'
import formidable         from 'formidable'
import fs                 from 'fs'

export const config = { api: { bodyParser: false } }

const MODEL_BUCKET = 'product-assets'
const MAX_SIZE     = 50 * 1024 * 1024
const GLB_MAGIC    = '676c5446'

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
  const modelFile = files?.model?.[0]

  if (!modelFile) throw new ApiError('INVALID_INPUT', 'No file uploaded. Use field name "model".', 400)
  if (modelFile.size > MAX_SIZE) {
    throw new ApiError('FILE_TOO_LARGE', `Model exceeds 50 MB (${(modelFile.size / 1024 / 1024).toFixed(2)} MB).`, 400)
  }

  const fd  = fs.openSync(modelFile.filepath, 'r')
  const buf = Buffer.alloc(4)
  fs.readSync(fd, buf, 0, 4, 0)
  fs.closeSync(fd)

  if (buf.toString('hex') !== GLB_MAGIC) {
    throw new ApiError('INVALID_FILE_TYPE', 'File does not appear to be a valid .glb (glTF Binary) model.', 400)
  }

  const storagePath = `models/${productId}/model.glb`
  const fileBuffer  = fs.readFileSync(modelFile.filepath)

  await supabaseAdmin.storage.from(MODEL_BUCKET).remove([storagePath]).catch(() => {})

  const { error: uploadErr } = await supabaseAdmin.storage
    .from(MODEL_BUCKET).upload(storagePath, fileBuffer, { contentType: 'model/gltf-binary', upsert: true })

  if (uploadErr) throw new Error(`Model upload failed: ${uploadErr.message}`)

  const { data: urlData } = supabaseAdmin.storage.from(MODEL_BUCKET).getPublicUrl(storagePath)
  const modelUrl = urlData?.publicUrl || storagePath

  const { error: updateErr } = await supabaseAdmin
    .from('products').update({ model_url: modelUrl, updated_at: new Date().toISOString() }).eq('id', productId)

  if (updateErr) throw new Error(`Failed to update model_url: ${updateErr.message}`)

  fs.unlink(modelFile.filepath, () => {})

  await logAdminAction(adminId, 'UPLOAD_PRODUCT_MODEL', { product_id: productId, model_url: modelUrl })

  return sendSuccess(res, { product_id: productId, model_url: modelUrl }, '3D model uploaded successfully.')
}

export default withMiddleware(handler, { requireAdmin: true })
