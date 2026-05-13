import { withMiddleware } from '../../../lib/middleware/withMiddleware.js'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { sendSuccess, sendError } from '../../../lib/responseFormatter.js'
import { assertMethod } from '../../../lib/validate.js'
import { calculateOrderTotal } from '../../../lib/orders/orderUtils.js'
import { ApiError } from '../../../lib/errorHandler.js'

/**
 * GET  /api/orders  — list current user's orders (paginated)
 * POST /api/orders  — create a new order from cart or direct item list
 */
async function handler(req, res) {
  assertMethod(req, ['GET', 'POST'])

  if (req.method === 'GET') return listOrders(req, res)
  if (req.method === 'POST') return createOrder(req, res)
}

/**
 * GET /api/orders
 *
 * Returns the authenticated user's orders, newest first.
 * Query params:
 *   status  {string}  — filter by order status
 *   page    {number}  — default 1
 *   limit   {number}  — default 10, max 50
 */
async function listOrders(req, res) {
  const { status, page = '1', limit = '10' } = req.query

  const pageNum  = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const offset   = (pageNum - 1) * limitNum

  let query = supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      delivery_method,
      created_at,
      updated_at,
      order_items ( id, quantity, unit_price )
    `, { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: orders, error, count } = await query
  if (error) throw error

  return sendSuccess(res, {
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      total_pages: Math.ceil(count / limitNum),
    },
  })
}

/**
 * POST /api/orders
 *
 * Creates a new order.
 *
 * Body:
 * {
 *   items: [
 *     { variant_id: "uuid", quantity: 2 },
 *     ...
 *   ],
 *   delivery_method: "pickup" | "delivery",
 *   delivery_address: "123 Main St, Lagos",  // required if delivery_method = "delivery"
 *   notes: "Leave at gate"                   // optional
 * }
 *
 * What it does:
 *   1. Validates all items and checks stock
 *   2. Calculates total from DB prices (never trusts client-side prices)
 *   3. Creates the order row with status = 'pending_payment'
 *   4. Creates order_items rows
 *   5. Decrements stock_qty for stock-type products
 *   6. Returns the created order
 */
async function createOrder(req, res) {
  const { items, delivery_method, delivery_address, notes } = req.body

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return sendError(res, 'VALIDATION_ERROR', 'items must be a non-empty array.')
  }
  if (!delivery_method || !['pickup', 'delivery'].includes(delivery_method)) {
    return sendError(res, 'VALIDATION_ERROR', "delivery_method must be 'pickup' or 'delivery'.")
  }
  if (delivery_method === 'delivery' && !delivery_address?.trim()) {
    return sendError(res, 'VALIDATION_ERROR', 'delivery_address is required for delivery orders.', 400, 'delivery_address')
  }

  // Validate item shape
  for (const item of items) {
    if (!item.variant_id || typeof item.quantity !== 'number' || item.quantity < 1) {
      return sendError(res, 'VALIDATION_ERROR', 'Each item must have a valid variant_id and quantity >= 1.')
    }
  }

  // Calculate total and build line items (validates stock & availability)
  const { total, lineItems } = await calculateOrderTotal(items)

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: req.user.id,
      status: 'pending_payment',
      total_amount: total,
      delivery_method,
      delivery_address: delivery_address?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select('id, status, total_amount, delivery_method, delivery_address, notes, created_at')
    .single()

  if (orderError) throw orderError

  // Insert order items
  const orderItemsPayload = lineItems.map(item => ({
    order_id: order.id,
    ...item,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItemsPayload)

  if (itemsError) {
    // Rollback: delete the order we just created
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    throw itemsError
  }

  // Decrement stock for stock-type products only
  for (const item of items) {
    await supabaseAdmin.rpc('decrement_stock', {
      p_variant_id: item.variant_id,
      p_quantity: item.quantity,
    }).catch(() => {
      // Non-fatal here — stock sync is also handled by DB trigger
      // Log but don't fail the order creation
    })
  }

  return sendSuccess(
    res,
    { ...order, order_items: orderItemsPayload },
    'Order created successfully.',
    201
  )
}

export default withMiddleware(handler, { requireAuth: true })
