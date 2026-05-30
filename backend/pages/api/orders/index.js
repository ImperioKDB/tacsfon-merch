
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js';
import { sendSuccess } from '../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js';
import { notifyAdmins } from '../../../lib/telegram/sendTelegram.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { delivery_address, phone } = req.body;
    const userId = req.user.id;

    const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single();
    if (!cart || !cart.cart_items?.length) return res.status(400).json({ error: "Cart empty" });

    // AUDIT #21: Re-verify stock before creating order
    const { total, lineItems } = await calculateOrderTotal(cart.cart_items);

    const { data: order, error } = await supabaseAdmin.from('orders').insert({
      user_id: userId, total, delivery_address, phone, status: 'pending'
    }).select().single();

    if (error) throw error;

    // Use Phase 1 RPC for atomic stock decrement and item creation (AUDIT #2 & #3)
    const { error: rpcErr } = await supabaseAdmin.rpc('place_order_items_secure', {
        p_order_id: order.id,
        p_items: lineItems
    });

    if (rpcErr) {
        await supabaseAdmin.from('orders').delete().eq('id', order.id); // Rollback
        return res.status(400).json({ success: false, error: rpcErr.message });
    }

    // Clear cart (AUDIT #2)
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);

    // AUDIT #7: Notifications are now server-forced, not client-controlled body
    const msg = `🛍️ NEW ORDER: #${order.id.slice(0,8)} | Total: ₦${total.toLocaleString()}`;
    notifyAdmins(msg); 

    return sendSuccess(res, order, 'Order successful');
  }
}
export default withMiddleware(handler, { requireAuth: true });
