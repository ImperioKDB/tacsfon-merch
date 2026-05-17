/**
 * DELETE /api/admin/categories/:id
 *
 * Deletes a category.
 * Blocked if any products are currently assigned to it.
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { logAdminAction } from '../../../../lib/admin/adminLogger.js'

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use DELETE.' } })
  }

  const { id } = req.query
  const adminId = req.user.id

  const { count } = await supabaseAdmin
    .from('products').select('id', { count: 'exact', head: true }).eq('category_id', id)

  if (count > 0) {
    throw new ApiError(
      'CATEGORY_IN_USE',
      `Cannot delete — ${count} product(s) are assigned to this category. Reassign them first.`,
      409
    )
  }

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete category: ${error.message}`)

  await logAdminAction(adminId, 'DELETE_CATEGORY', { category_id: id })

  return sendSuccess(res, { id }, 'Category deleted successfully.')
}

export default withMiddleware(handler, { requireAdmin: true })
