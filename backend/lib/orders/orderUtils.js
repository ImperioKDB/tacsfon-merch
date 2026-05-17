import { supabaseAdmin } from '../supabase.js'
import { ApiError }      from '../errorHandler.js'

// ─────────────────────────────────────────────────────────────
// Status transition map
// DB CHECK constraint values (as of schema audit):
//   pending_payment → payment_submitted → confirmed → dispatched → received
//   cancelled is reachable from pending_payment only (student cancel)
// ─────────────────────────────────────────────────────────────
export const VALID_TRANSITIONS = {
  pending_payment:   ['payment_submitted', 'cancelled'],
  payment_submitted: ['confirmed', 'cancelled'],
  confirmed:         ['dispatched'],
  dispatched:        ['received'],
  received:          [],
  cancelled:         [],
}

export function isValidTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || []
  return allowed.includes(newStatus)
}

export function assertValidTransition(fromStatus, toStatus) {
  if (!isValidTransition(fromStatus, toStatus)) {
    throw new ApiError(
      'INVALID_STATUS_CHANGE',
      `Cannot move order from '${fromStatus}' to '${toStatus}'.`,
      400
    )
  }
}

// FIX: corrected column names
//   total_amount        → total
//   delivery_method     → removed (column does not exist)
//   notes               → removed (column does not exist)
//   product_variant_id  → variant_id  (FK column in order_items)
export async function getOrderWithItems(orderId, userId = null) {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      id, status, payment_status, proof_url, total,
      delivery_address,
      created_at, updated_at, user_id,
      order_items (
        id, quantity, unit_price,
        variant_id,
        product_variants (
          id, size, color,
          products ( id, name, image_url )
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error || !data) return null
  return data
}

export async function calculateOrderTotal(items) {
  const variantIds = items.map(i => i.variant_id)

  const { data: variants, error } = await supabaseAdmin
    .from('product_variants')
    .select('id, price_override, products(base_price)')
    .in('id', variantIds)

  if (error) throw new Error('Failed to fetch variant prices.')

  let total = 0
  const lineItems = []

  for (const item of items) {
    const variant = variants.find(v => v.id === item.variant_id)
    if (!variant) throw new ApiError('VARIANT_NOT_FOUND', `Variant ${item.variant_id} not found.`, 404)
    const unitPrice = variant.price_override ?? variant.products.base_price
    total += unitPrice * item.quantity
    lineItems.push({ variant_id: item.variant_id, quantity: item.quantity, unit_price: unitPrice })
  }

  return { total, lineItems }
}
