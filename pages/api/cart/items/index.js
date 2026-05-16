/**
 * POST /api/cart/items
 * Add an item to the cart (or increment quantity if variant already exists).
 *
 * Phase 12: rate limit 'cart' + zod validation
 */
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../lib/supabase.js'
import { validateBody }   from '../../../../lib/middleware/validate.js'
import { AddCartItemSchema } from '../../../../lib/schemas/cartSchemas.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } })
  }

  const userId = req.user.id
  // Phase 12: validate body with zod
  const { variant_id, quantity } = validateBody(req, AddCartItemSchema)

  // Verify variant exists and product is available
  const { data: variant, error: vErr } = await supabaseAdmin
    .from('product_variants')
    .select('id, stock_qty, stock_type, products(id, name, is_available)')
    .eq('id', variant_id)
    .single()

  if (vErr || !variant) throw new ApiError('VARIANT_NOT_FOUND', 'Variant not found.', 404)
  if (!variant.products?.is_available) {
    throw new ApiError('PRODUCT_UNAVAILABLE', `"${variant.products.name}" is no longer available.`, 400)
  }

  if (variant.stock_type === 'stock' && variant.stock_qty < quantity) {
    throw new ApiError('INSUFFICIENT_STOCK', `Only ${variant.stock_qty} unit(s) available.`, 400)
  }

  // Get or create cart
  let { data: cart } = await supabaseAdmin
    .from('carts').select('id').eq('user_id', userId).single()

  if (!cart) {
    const { data: newCart, error: cErr } = await supabaseAdmin
      .from('carts').insert({ user_id: userId }).select().single()
    if (cErr) throw new Error(`Failed to create cart: ${cErr.message}`)
    cart = newCart
  }

  // Upsert cart item (increment on conflict)
  const { data: item, error: iErr } = await supabaseAdmin
    .from('cart_items')
    .upsert(
      { cart_id: cart.id, variant_id, quantity },
      { onConflict: 'cart_id,variant_id', ignoreDuplicates: false }
    )
    .select().single()

  if (iErr) throw new Error(`Failed to add cart item: ${iErr.message}`)

  return sendSuccess(res, item, 'Item added to cart.', 201)
}

export default withMiddleware(handler, { requireAuth: true, rateLimit: 'cart' })
