import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../lib/responseFormatter.js'
import { supabaseAdmin }  from '../../../lib/supabase.js'
import { assertMethod }   from '../../../lib/validate.js'

async function handler(req, res) {
  assertMethod(req, ['GET', 'DELETE'])
  const userId = req.user.id
  if (req.method === 'GET') return getCart(req, res, userId)
  return clearCart(req, res, userId)
}

async function getCart(req, res, userId) {
  const { data: cart } = await supabaseAdmin
    .from('carts').select('id').eq('user_id', userId).single()

  if (!cart) {
    return sendSuccess(res, { id: null, user_id: userId, items: [], total: 0 })
  }

  // FIX #1: added variant_id to select
  const { data: items, error } = await supabaseAdmin
    .from('cart_items')
    .select(`id, variant_id, quantity, created_at, updated_at,
       products ( id, name, base_price, image_url, is_available, stock_type ),
       product_variants ( id, size, color, stock_qty, price_override )`)
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: true })

  if (error) throw error

  // FIX #1: map to nested shape matching CartItem type (variant.product)
  const enriched = (items ?? []).map((item) => {
    const unitPrice = item.product_variants?.price_override ?? item.products?.base_price ?? 0
    return {
      id:         item.id,
      cart_id:    cart.id,
      variant_id: item.variant_id,
      quantity:   item.quantity,
      unit_price: unitPrice,
      line_total: unitPrice * item.quantity,
      variant:    item.product_variants
        ? { ...item.product_variants, product: item.products ?? null }
        : null,
    }
  })

  const total = enriched.reduce((sum, i) => sum + i.line_total, 0)
  // FIX #1: return Cart-shaped object (was { cart, items, subtotal })
  return sendSuccess(res, { id: cart.id, user_id: userId, items: enriched, total })
}

async function clearCart(req, res, userId) {
  const { data: cart } = await supabaseAdmin
    .from('carts').select('id').eq('user_id', userId).single()

  if (!cart) {
    return sendSuccess(res, { id: null, user_id: userId, items: [], total: 0 }, 'Cart already empty.')
  }

  const { error } = await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id)
  if (error) throw error
  return sendSuccess(res, { id: cart.id, user_id: userId, items: [], total: 0 }, 'Cart cleared.')
}

export default withMiddleware(handler, { requireAuth: true })
