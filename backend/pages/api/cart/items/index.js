import { withMiddleware }    from '../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }       from '../../../../lib/responseFormatter.js'
import { ApiError }          from '../../../../lib/errorHandler.js'
import { supabaseAdmin }     from '../../../../lib/supabase.js'
import { validateBody }      from '../../../../lib/middleware/validate.js'
import { AddCartItemSchema } from '../../../../lib/schemas/cartSchemas.js'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED' } })
  const userId = req.user.id
  const { variant_id, quantity } = validateBody(req, AddCartItemSchema)
  const { data: variant } = await supabaseAdmin.from('product_variants').select('id, stock_qty, products(id, name, is_available)').eq('id', variant_id).single()
  if (!variant || !variant.products?.is_available) throw new ApiError('PRODUCT_UNAVAILABLE', 'Product unavailable', 400)
  if (variant.stock_qty < quantity) throw new ApiError('INSUFFICIENT_STOCK', 'Not enough stock', 400)
  let { data: cart } = await supabaseAdmin.from('carts').select('id').eq('user_id', userId).single()
  if (!cart) {
    const { data: newCart } = await supabaseAdmin.from('carts').insert({ user_id: userId }).select().single()
    cart = newCart
  }
  const { data: item } = await supabaseAdmin.from('cart_items').upsert({ cart_id: cart.id, variant_id, quantity }, { onConflict: 'cart_id,variant_id' }).select().single()
  return sendSuccess(res, item, 'Added to cart', 201)
}
export default withMiddleware(handler, { requireAuth: true, rateLimit: 'cart' })