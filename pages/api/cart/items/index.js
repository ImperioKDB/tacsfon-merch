import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../../lib/responseFormatter.js'
import { ApiError } from '../../../../lib/errorHandler.js'
import { supabaseAdmin } from '../../../../lib/supabase.js'
import { assertMethod, validateUUID } from '../../../../lib/validate.js'

/**
 * POST /api/cart/items
 *
 * Body: { product_id, variant_id, quantity }
 *
 * - Creates cart if this is the user's first item
 * - If product+variant already in cart → increments quantity (UPSERT)
 * - Validates product exists, is available, variant belongs to product
 * - Validates stock when stock_type is 'stock' or 'both'
 * - Returns the full updated cart
 *
 * Phase 4 — Cart
 */
async function handler(req, res) {
  assertMethod(req, ['POST'])

  const userId = req.user.id
  const { product_id, variant_id = null, quantity } = req.body ?? {}

  // ── Input validation ─────────────────────────
  if (!product_id) {
    throw new ApiError('VALIDATION_ERROR', "'product_id' is required.", 400)
  }
  validateUUID(product_id, 'product_id')
  if (variant_id) validateUUID(variant_id, 'variant_id')

  const qty = parseInt(quantity, 10)
  if (!qty || qty < 1) {
    throw new ApiError('VALIDATION_ERROR', "'quantity' must be a positive integer.", 400)
  }

  // ── Fetch product ────────────────────────────
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, name, base_price, is_available, stock_type')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    throw new ApiError('NOT_FOUND', 'Product not found.', 404)
  }

  if (!product.is_available) {
    throw new ApiError('PRODUCT_UNAVAILABLE', 'This product is currently unavailable.', 400)
  }

  // ── Fetch variant (if provided) ──────────────
  let variant = null
  if (variant_id) {
    const { data, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .select('id, size, color, stock_qty, price_override, product_id')
      .eq('id', variant_id)
      .single()

    if (variantError || !data) {
      throw new ApiError('NOT_FOUND', 'Variant not found.', 404)
    }
    if (data.product_id !== product_id) {
      throw new ApiError('VALIDATION_ERROR', 'Variant does not belong to this product.', 400)
    }
    variant = data
  }

  // ── Stock check ──────────────────────────────
  if (['stock', 'both'].includes(product.stock_type)) {
    const stockQty = variant?.stock_qty ?? 0
    if (stockQty < qty) {
      throw new ApiError(
        'INSUFFICIENT_STOCK',
        `Only ${stockQty} unit(s) available for this item.`,
        400
      )
    }
  }
  // preorder → no stock check

  // ── Get or create cart ───────────────────────
  let cartId
  const { data: existingCart } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingCart) {
    cartId = existingCart.id
  } else {
    const { data: newCart, error: cartError } = await supabaseAdmin
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (cartError) throw cartError
    cartId = newCart.id
  }

  // ── Check if item already exists (same product + variant) ────
  const { data: existingItem } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', product_id)
    .eq('variant_id', variant_id ?? null)   // null-safe equality
    .maybeSingle()

  if (existingItem) {
    // Increment quantity
    const newQty = existingItem.quantity + qty

    // Re-check stock with combined quantity
    if (['stock', 'both'].includes(product.stock_type)) {
      const stockQty = variant?.stock_qty ?? 0
      if (stockQty < newQty) {
        throw new ApiError(
          'INSUFFICIENT_STOCK',
          `Cannot add ${qty} more. Only ${stockQty} unit(s) available and you already have ${existingItem.quantity} in your cart.`,
          400
        )
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existingItem.id)

    if (updateError) throw updateError
  } else {
    // Insert new cart item
    const { error: insertError } = await supabaseAdmin
      .from('cart_items')
      .insert({
        cart_id:    cartId,
        product_id,
        variant_id: variant_id ?? null,
        quantity:   qty,
      })

    if (insertError) throw insertError
  }

  // ── Return updated cart ──────────────────────
  const { data: items, error: fetchError } = await supabaseAdmin
    .from('cart_items')
    .select(
      `id, quantity, created_at, updated_at,
       products ( id, name, base_price, image_url, is_available, stock_type ),
       product_variants ( id, size, color, stock_qty, price_override )`
    )
    .eq('cart_id', cartId)
    .order('created_at', { ascending: true })

  if (fetchError) throw fetchError

  const enriched = (items ?? []).map((item) => {
    const unitPrice =
      item.product_variants?.price_override ?? item.products?.base_price ?? 0
    return { ...item, unit_price: unitPrice, line_total: unitPrice * item.quantity }
  })

  const subtotal = enriched.reduce((sum, i) => sum + i.line_total, 0)

  return sendSuccess(
    res,
    { cart: { id: cartId }, items: enriched, subtotal },
    'Item added to cart.',
    existingItem ? 200 : 201
  )
}

export default withMiddleware(handler, { requireAuth: true })
