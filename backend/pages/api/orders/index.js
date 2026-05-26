
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js';
import { sendSuccess } from '../../../lib/responseFormatter.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js';
import { notifyAdmins } from '../../../lib/telegram/sendTelegram.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { delivery_address, phone, signal_only } = req.body;
    const userId = req.user.id;

    // Fetch current profile for the Telegram message
    const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', userId).single();

    const { data: cart } = await supabaseAdmin.from('carts').select('id, cart_items(*)').eq('user_id', userId).single();
    const { total } = await calculateOrderTotal(cart.cart_items);

    // Create the order in the database
    const { data: order } = await supabaseAdmin.from('orders').insert({
      user_id: userId, total, delivery_address, phone, status: 'pending_payment'
    }).select().single();

    // IF USER CLICKED THE BUTTON: Send Telegram Alert
    if (signal_only) {
      const message = `🚨 <b>PAYMENT CLAIMED</b>\n\nStudent: ${profile.full_name}\nOrder ID: #${order.id.slice(0,8)}\nAmount: ₦${total.toLocaleString()}\n\nWaiting for proof upload...`;
      notifyAdmins(message);
    }

    return sendSuccess(res, order, 'Order initiated');
  }
}
export default withMiddleware(handler, { requireAuth: true });
