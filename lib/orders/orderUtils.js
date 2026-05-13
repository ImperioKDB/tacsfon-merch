import { supabaseAdmin } from '../supabase.js'
import { ApiError } from '../errorHandler.js'

/**
 * Valid order status transitions.
 * An order can only move forward — never backwards (except admin override in Phase 11).
 *
 *   pending_payment → payment_submitted → confirmed → processing
 *   → ready_for_pickup / shipped → delivered → completed
 *
 * cancelled is a terminal state reachable from pending_payment only (by user)
 * or from any state (by admin in Phase 11).
 */
export const VALID_TRANSITIONS = {
  pending_payment:    ['payment_submitted', 'cancelled'],
  payment_submitted:  ['confirmed', 'cancelled'],
  confirmed:          ['processing'],
  processing:         ['ready_for_pickup', 'shipped'],
  ready_for_pickup:   ['delivered'],
  shipped:            ['delivered'],
  delivered:          ['completed'],
  completed:          [],   // terminal
  cancelled:          [],   // terminal
}

/**
 * Validates that a status transition is allowed.
 * Throws ApiError(INVALID_STATUS_CHANGE, 400) if not.
 */
export function assertValidTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || []
  if (!allowed.includes(toStatus)) {
    throw new ApiError(
      'INVALID_STATUS_CHANGE',
      `Cannot move order from '${fromStatus}' to '${toStatus}'.`,
      400
    )
  }
}

/**
 * Fetches a single order with its full item list.
 * Returns null if not found.
 *
 * @param {string} orderId
 * @param {string} userId  - if provided, ensures order belongs to this user
 */
export async function getOrderWithItems(orderId, userId = null) {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      delivery_method,
      delivery_address,
      notes,
      created_at,
      updated_at,
      order_items (
        id,
        quantity,
        unit_price,
        product_variant_id,
        product_variants (
          id, size, color,
          products ( id, name, image_url )
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error || !data) return null
  return data
}

/**
 * Calculates the total amount for an order from its items.
 * Uses price_override if set on the variant, otherwise base_price.
 *
 * @param {Array} items  - array of { variant_id, quantity }
 * @returns {Promise<{ total: number, lineItems: Array }>}
 */
export async function calculateOrderTotal(items) {
  const variantIds = items.map(i => i.variant_id)

  const { data: variants, error } = await supabaseAdmin
    .from('product_variants')
    .select('id, stock_qty, price_override, products ( id, name, base_price, is_available, stock_type )')
    .in('id', variantIds)

  if (error) throw error

  const variantMap = Object.fromEntries(variants.map(v => [v.id, v]))

  let total = 0
  const lineItems = []

  for (const item of items) {
    const variant = variantMap[item.variant_id]

    if (!variant) {
      throw new ApiError('PRODUCT_UNAVAILABLE', `Variant ${item.variant_id} not found.`, 400)
    }
    if (!variant.products.is_available) {
      throw new ApiError('PRODUCT_UNAVAILABLE', `'${variant.products.name}' is no longer available.`, 400)
    }

    // Check stock only for stock-type products (preorders allow qty > stock)
    if (variant.products.stock_type === 'stock' && variant.stock_qty < item.quantity) {
      throw new ApiError(
        'INSUFFICIENT_STOCK',
        `Only ${variant.stock_qty} unit(s) of '${variant.products.name}' left in stock.`,
        400
      )
    }

    const unitPrice = variant.price_override ?? variant.products.base_price
    const lineTotal = unitPrice * item.quantity

    total += lineTotal
    lineItems.push({
      product_variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: unitPrice,
    })
  }

  return { total, lineItems }
}
