/**
 * PATCH /api/cart/items/:id  — update quantity
 * DELETE /api/cart/items/:id — remove item
 *
 * Phase 12: rate limit 'cart' + zod validation on PATCH
 */
import { withMiddleware }    from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }       from '../../../../lib/responseFormatter.js'
import { ApiError }          from '../../../../lib/errorHandler.js'
import { supabaseAdmin }     from '../../../../lib/supabase.js'
import { validateUUID }      from '../../../../lib/validate.js'
import { validateBody }      from '../../../../lib/middleware/validate.js'
import { UpdateCartItemSchema } from '../../../../lib/schemas/cartSchemas.js'

async function handler(req, res) {
  const { id } = req.query
  validateUUID(id, 'cart item id')

  if (req.method === 'PATCH') {
    // Phase 12: validate body
    const { quantity } = validateBody(req, UpdateCartItemSchema)

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .select().single()

    if (error || !data) throw new ApiError('ITEM_NOT_FOUND', 'Cart item not found.', 404)
    return sendSuccess(res, data, 'Cart item updated.')
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('cart_items').delete().eq('id', id)
    if (error) throw new Error(`Failed to remove cart item: ${error.message}`)
    return sendSuccess(res, { id }, 'Item removed from cart.')
  }

  return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PATCH or DELETE.' } })
}

export default withMiddleware(handler, { requireAuth: true, rateLimit: 'cart' })
