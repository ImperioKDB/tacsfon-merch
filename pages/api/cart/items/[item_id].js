import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../../lib/responseFormatter.js'
import { ApiError } from '../../../../lib/errorHandler.js'
import { supabaseAdmin } from '../../../../lib/supabase.js'
import { assertMethod, validateUUID } from '../../../../lib/validate.js'

/**
 * PATCH  /api/cart/items/:item_id  — update quantity
 * DELETE /api/cart/items/:item_id  — remove item
 *
 * Both validate the item belongs to the current user's cart (never 404-leak).
 * PATCH with quantity = 0 deletes the item.
 *
 * Phase 4 — Cart
 */
async function handler(req, res) {
  assertMethod(req, ['PATCH', 'DELETE'])

  const { item_id } = req.query
  validateUUID(item_id, 'item_id')

  const userId = req.user.id

  // ── Verify ownership ─────────────────────────
  // Fetch item + cart in one query so we can confirm it belongs to this user
  const { data: item, error: itemError } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity, cart_id, carts ( user_id )')
    .eq('id', item_id)
    .single()

  if (itemError || !item) {
    throw new ApiError('CART_ITEM_NOT_FOUND', 'Cart item not found.', 404)
  }

  if (item.carts?.user_id !== userId) {
    // Return 403 — don't expose whether the item exists for other users
    throw new ApiError('FORBIDDEN', 'You do not have access to this cart item.', 403)
  }

  if (req.method === 'DELETE') {
    return removeItem(req, res, item_id)
  }

  return updateItem(req, res, item, userId)
}

// ── PATCH ─────────────────────────────────────
async function updateItem(req, res, item, userId) {
  const { quantity } = req.body ?? {}
  const qty = parseInt(quantity, 10)

  if (isNaN(qty) || qty < 0) {
    throw new ApiError('VALIDATION_ERROR', "'quantity' must be a non-negative integer.", 400)
  }

  // quantity = 0 → delete item
  if (qty === 0) {
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', item.id)

    if (error) throw error
    return sendSuccess(res, null, 'Item removed from cart.')
  }

  // Otherwise update quantity
  const { error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity: qty })
    .eq('id', item.id)

  if (error) throw error

  return sendSuccess(res, null, 'Cart item updated.')
}

// ── DELETE ────────────────────────────────────
async function removeItem(req, res, itemId) {
  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error

  return sendSuccess(res, null, 'Item removed from cart.')
}

export default withMiddleware(handler, { requireAuth: true })
