
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js';
import { sendSuccess } from '../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js';
import { notifyAdmins } from '../../../lib/telegram/sendTelegram.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { delivery_address, phone, signal_only } = req.body;
    const userId = req.user.id;

    const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', userId).single();
    const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single();
    
    // Validate stock exists for all items before starting
    const { total } = await calculateOrderTotal(cart.cart_items);

    // Create order
    const { data: order, error } = await supabaseAdmin.from('orders').insert({
      user_id: userId, total, delivery_address, phone, status: 'pending'
    }).select().single();

    if (error) throw error;

    // FIRE AND FORGET TELEGRAM (Doesn't block user)
    if (signal_only) {
      const message = `🚨 <b>PAYMENT CLAIMED</b>\n\nStudent: ${profile?.full_name}\nOrder ID: #${order.id.slice(0,8)}\nAmount: ₦${total.toLocaleString()}`;
      notifyAdmins(message); // This is non-blocking
    }

    return sendSuccess(res, order, 'Order initiated');
  }
}
export default withMiddleware(handler, { requireAuth: true });
