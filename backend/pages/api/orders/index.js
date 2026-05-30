
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js';
import { sendSuccess, sendError } from '../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js';

async function handler(req, res) {
  // AUDIT FIX #5: Explicitly handle methods to prevent hanging GETs
  if (req.method === 'GET') {
      const { data } = await supabaseAdmin.from('orders').select('*').eq('user_id', req.user.id);
      return sendSuccess(res, data);
  }

  if (req.method === 'POST') {
    const userId = req.user.id;
    const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single();
    
    // AUDIT FIX #4: Prevent crash on empty cart
    if (!cart || !cart.cart_items?.length) {
        return res.status(400).json({ success: false, error: { code: 'CART_EMPTY', message: 'Add items first' } });
    }

    const { total } = await calculateOrderTotal(cart.cart_items);

    // AUDIT FIX #1: Align status with DB enum
    const { data: order, error } = await supabaseAdmin.from('orders').insert({
      user_id: userId, total, status: 'pending', payment_status: 'unpaid'
    }).select().single();

    if (error) throw error;

    // Clear cart after order (Audit Fix #2)
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);

    return sendSuccess(res, order, 'Order initiated');
  }
}
export default withMiddleware(handler, { requireAuth: true });
