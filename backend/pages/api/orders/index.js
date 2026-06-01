import { withMiddleware } from '../../../lib/middleware/withMiddleware.js';
import { sendSuccess } from '../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js';
import { notifyAdmins } from '../../../lib/telegram/sendTelegram.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('orders').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
    return sendSuccess(res, data || []);
  }

  if (req.method === 'POST') {
    try {
      const { delivery_address, phone } = req.body;
      const userId = req.user.id;

      const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single();
      if (!cart || !cart.cart_items?.length) return res.status(400).json({ error: "Cart empty" });

      const { total, lineItems } = await calculateOrderTotal(cart.cart_items);

      const { data: order, error: orderErr } = await supabaseAdmin.from('orders').insert({
        user_id: userId, total, delivery_address, phone, 
        status: 'pending_payment', payment_status: 'unpaid', type: 'online'
      }).select().single();

      if (orderErr) throw orderErr;

      const { error: rpcErr } = await supabaseAdmin.rpc('place_order_items_secure', {
        p_order_id: order.id,
        p_items: lineItems
      });

      if (rpcErr) {
        await supabaseAdmin.from('orders').delete().eq('id', order.id); 
        return res.status(400).json({ success: false, error: { message: rpcErr.message } });
      }

      await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);

      // FIX: Use try/catch because notifyAdmins may return undefined, causing .catch() to fail
      if (typeof notifyAdmins === 'function') {
          try {
              notifyAdmins(`🛍️ NEW ORDER: #${order.id.slice(0,8)}\nTotal: ₦${total.toLocaleString()}`);
          } catch (e) {
              console.error("Telegram Notification failed silently:", e.message);
          }
      }

      return sendSuccess(res, order);
    } catch (err) {
      console.error("Critical Order Failure:", err.message);
      return res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}
export default withMiddleware(handler, { requireAuth: true });