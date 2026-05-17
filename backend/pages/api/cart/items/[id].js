/**
 * PATCH  /api/cart/items/:id  — update quantity (quantity=0 removes item)
 * DELETE /api/cart/items/:id  — remove item
 *
 * Validates ownership: item must belong to current user's cart.
 * Phase 12: rate limit 'cart' + zod validation on PATCH
 */
import { withMiddleware }       from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }          from '../../../../lib/responseFormatter.js'
import { ApiError }             from '../../../../lib/errorHandler.js'
import { supabaseAdmin }        from '../../../../lib/supabase.js'
import { assertMethod, validateUUID } from '../../../../lib/validate.js'
import { validateBody }         from '../../../../lib/middleware/validate.js'
import { UpdateCartItemSchema } from '../../../../lib/schemas/cartSchemas.js'

async function handler(req, res) {
  assertMethod(req, ['PATCH', 'DELETE'])

  const { id } = req.query
  validateUUID(id, 'cart item id')

  const userId = req.user.id

  // Verify ownership — item must belong to this user's cart
  const { data: item, error: itemError } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity, cart_id, carts ( user_id )')
    .eq('id', id)
    .single()

  if (itemError || !item) {
    throw new ApiError('CART_ITEM_NOT_FOUND', 'Cart item not found.', 404)
  }

  if (item.carts?.user_id !== userId) {
    throw new ApiError('FORBIDDEN', 'You do not have access to this cart item.', 403)
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('cart_items').delete().eq('id', id)
    if (error) throw new Error(`Failed to remove cart item: ${error.message}`)
    return sendSuccess(res, null, 'Item removed from cart.')
  }

  // PATCH — validate body with zod
  const { quantity } = validateBody(req, UpdateCartItemSchema)

  // quantity = 0 → delete item
  if (quantity === 0) {
    const { error } = await supabaseAdmin.from('cart_items').delete().eq('id', id)
    if (error) throw new Error(`Failed to remove cart item: ${error.message}`)
    return sendSuccess(res, null, 'Item removed from cart.')
  }

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select().single()

  if (error || !data) throw new ApiError('CART_ITEM_NOT_FOUND', 'Cart item not found.', 404)
  return sendSuccess(res, data, 'Cart item updated.')
}

export default withMiddleware(handler, { requireAuth: true, rateLimit: 'cart' })
