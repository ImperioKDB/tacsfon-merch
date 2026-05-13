import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { assertMethod } from '../../../lib/validate.js'

/**
 * GET /api/categories
 *
 * Returns all categories ordered alphabetically.
 * Public — no auth required.
 *
 * Cache header: 5-minute stale-while-revalidate
 *
 * Phase 3 — Products & Catalogue
 */
async function handler(req, res) {
  assertMethod(req, ['GET'])

  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, created_at')
    .order('name', { ascending: true })

  if (error) throw error

  // 5-minute cache
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  return sendSuccess(res, { categories: categories ?? [] })
}

// Fully public — no auth middleware needed
export default withMiddleware(handler)
