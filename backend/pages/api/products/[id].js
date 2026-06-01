
import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { sendSuccess } from '../../../lib/responseFormatter.js'
import { supabaseAdmin } from '../../../lib/supabase.js'

async function handler(req, res) {
  const { id } = req.query;
  
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
       *,
       categories ( id, name ),
       product_variants ( id, size, color, stock_qty, price_override )
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product missing" } });
  }

  return sendSuccess(res, product);
}

export default withMiddleware(handler, { optionalAuth: true });
