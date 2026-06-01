
import { withMiddleware } from '../../../../lib/middleware/withMiddleware.js';
import { sendSuccess } from '../../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../../lib/supabase.js';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const userId = req.user.id;
  const { variant_id, quantity } = req.body;

  // 1. Find the product_id belonging to this variant
  const { data: variant, error: vErr } = await supabaseAdmin
    .from('product_variants')
    .select('product_id')
    .eq('id', variant_id)
    .single();

  if (vErr || !variant) return res.status(400).json({ error: "Invalid variant" });

  // 2. Ensure user has a cart
  let { data: cart } = await supabaseAdmin.from('carts').select('id').eq('user_id', userId).single();
  if (!cart) {
    const { data: newCart } = await supabaseAdmin.from('carts').insert({ user_id: userId }).select().single();
    cart = newCart;
  }

  // 3. Upsert into cart_items with BOTH IDs (Fixes the Empty Cart bug)
  const { data: item, error: iErr } = await supabaseAdmin
    .from('cart_items')
    .upsert({ 
        cart_id: cart.id, 
        variant_id, 
        product_id: variant.product_id, // CRITICAL FIX
        quantity 
    }, { onConflict: 'cart_id,variant_id' })
    .select()
    .single();

  if (iErr) throw iErr;

  return sendSuccess(res, item, 'Cart updated');
}
export default withMiddleware(handler, { requireAuth: true });
