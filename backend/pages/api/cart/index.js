import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { assertMethod } from '../../../lib/validate.js'

/**
 * GET  /api/cart  — fetch current user's cart with full item details
 * DELETE /api/cart  — clear all items (keeps the cart row)
 *
 * Both require auth. GET returns an empty cart structure instead of 404
 * when the user has never added anything.
 *
 * Phase 4 — Cart
 */
async function handler(req, res) {
  assertMethod(req, ['GET', 'DELETE'])
  const userId = req.user.id

  if (req.method === 'GET') {
    return getCart(req, res, userId)
  }

  return clearCart(req, res, userId)
}

// ── GET ──────────────────────────────────────
async function getCart(req, res, userId) {
  // Look up cart row
  const { data: cart } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  // No cart yet — return empty structure (never 404)
  if (!cart) {
    return sendSuccess(res, { cart: null, items: [], subtotal: 0 })
  }

  // Fetch items with product + variant detail
  const { data: items, error } = await supabaseAdmin
    .from('cart_items')
    .select(
      `id, quantity, created_at, updated_at,
       products ( id, name, base_price, image_url, is_available, stock_type ),
       product_variants ( id, size, color, stock_qty, price_override )`
    )
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Attach effective unit price and line total to each item
  const enriched = (items ?? []).map((item) => {
    const unitPrice =
      item.product_variants?.price_override ?? item.products?.base_price ?? 0
    return {
      ...item,
      unit_price: unitPrice,
      line_total: unitPrice * item.quantity,
    }
  })

  const subtotal = enriched.reduce((sum, i) => sum + i.line_total, 0)

  return sendSuccess(res, { cart, items: enriched, subtotal })
}

// ── DELETE ────────────────────────────────────
async function clearCart(req, res, userId) {
  // Find cart (if it doesn't exist there's nothing to clear)
  const { data: cart } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (cart) {
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (error) throw error
  }

  return sendSuccess(res, null, 'Cart cleared.')
}

export default withMiddleware(handler, { requireAuth: true })
