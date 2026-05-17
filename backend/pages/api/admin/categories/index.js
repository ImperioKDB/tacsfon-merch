/**
 * POST /api/admin/categories
 *
 * Creates a new product category.
 * Body: { name, description? }
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { logAdminAction } from '../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const adminId = req.user.id
  const { name, description } = req.body

  if (!name?.trim()) throw new ApiError('INVALID_INPUT', 'name is required.', 400)

  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: name.trim(), description: description?.trim() || null, created_at: new Date().toISOString() })
    .select().single()

  if (error) {
    if (error.code === '23505') {
      throw new ApiError('DUPLICATE_ENTRY', `A category named '${name.trim()}' already exists.`, 409)
    }
    throw new Error(`Failed to create category: ${error.message}`)
  }

  await logAdminAction(adminId, 'CREATE_CATEGORY', { category_id: category.id, name: category.name })

  return sendSuccess(res, category, 'Category created successfully.', 201)
}

export default withMiddleware(handler, { requireAdmin: true })
