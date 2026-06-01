
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js';
import { sendSuccess } from '../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js';
import { notifyAdmins } from '../../../lib/telegram/sendTelegram.js';

async function handler(req, res) {
  // Audit Fix #5: Handle GET requests to prevent hanging
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return sendSuccess(res, data);
  }

  if (req.method === 'POST') {
    try {
      const { delivery_address, phone } = req.body;
      const userId = req.user.id;

      // Audit Fix #4: Null check cart
      const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single();
      if (!cart || !cart.cart_items?.length) {
        return res.status(400).json({ success: false, error: { code: 'CART_EMPTY', message: 'Cart is empty' } });
      }

      // Audit Fix #21: Re-verify stock & calc total
      const { total, lineItems } = await calculateOrderTotal(cart.cart_items);

      // Audit Fix #1: Use 'pending' status to match Types/Utils
      const { data: order, error: orderErr } = await supabaseAdmin.from('orders').insert({
        user_id: userId, total, delivery_address, phone, status: 'pending', payment_status: 'unpaid', type: 'online'
      }).select().single();

      if (orderErr) throw orderErr;

      // Audit Fix #2 & #3: Atomic Stock Decrement via RPC
      const { error: rpcErr } = await supabaseAdmin.rpc('place_order_items_secure', {
        p_order_id: order.id,
        p_items: lineItems
      });

      if (rpcErr) {
        // Rollback order if stock fails
        await supabaseAdmin.from('orders').delete().eq('id', order.id);
        return res.status(400).json({ success: false, error: { code: 'STOCK_ERROR', message: rpcErr.message } });
      }

      // Audit Fix #2: Clear cart after successful order
      await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);

      // Audit Fix #7: Server-side forced notification
      const msg = `🛍️ <b>NEW ORDER: #${order.id.slice(0,8)}</b>\nTotal: ₦${total.toLocaleString()}\nStudent: ${userId}`;
      notifyAdmins(msg);

      return sendSuccess(res, order, 'Order successful');
    } catch (err) {
      console.error("Order Creation Failed:", err.message);
      return res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
export default withMiddleware(handler, { requireAuth: true });
