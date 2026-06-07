/**
 * lib/telegram/orderMessage.js
 *
 * Builds the Telegram HTML message for a new online order.
 * Includes: customer name, phone, email, delivery address,
 * itemised order list with size/colour/price, and total.
 */

export function buildNewOrderMessage(order) {
  const shortId   = order.id.slice(0, 8).toUpperCase()
  const customer  = order.profiles?.full_name  || order.customer_name || 'Unknown'
  const phone     = order.phone || order.profiles?.phone || 'N/A'
  const email     = order.profiles?.email || 'N/A'
  const total     = Number(order.total).toLocaleString('en-NG', { minimumFractionDigits: 0 })
  const delivery  = order.delivery_address || 'Not provided'
  const adminUrl  = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
    : 'your admin dashboard'

  const itemLines = (order.order_items || []).map((item, i) => {
    const name    = item.product_variants?.products?.name
                 ?? item.variant?.product?.name
                 ?? 'Product'
    const size    = item.product_variants?.size  ?? item.variant?.size  ?? ''
    const color   = item.product_variants?.color ?? item.variant?.color ?? ''
    const variant = [size, color].filter(Boolean).join(' / ')
    const qty     = item.quantity ?? 1
    const price   = item.unit_price
      ? `₦${Number(item.unit_price * qty).toLocaleString('en-NG')}`
      : ''
    return `  ${i + 1}. ${name}${variant ? ` (${variant})` : ''} ×${qty}${price ? ' — ' + price : ''}`
  }).join('\n')

  return [
    '🛍️ <b>New TACSFON Merch Order!</b>',
    '',
    `<b>Order ID:</b>  #${shortId}`,
    '',
    '👤 <b>Buyer Details</b>',
    `<b>Name:</b>     ${customer}`,
    `<b>Phone:</b>    ${phone}`,
    `<b>Email:</b>    ${email}`,
    '',
    '📦 <b>Order Items</b>',
    itemLines || '  (No items)',
    '',
    `<b>Total:</b>    ₦${total}`,
    '',
    '📍 <b>Delivery Address</b>',
    delivery,
    '',
    `<a href="${adminUrl}">🔗 Open Admin Dashboard →</a>`,
  ].join('\n')
}

/**
 * Builds a Telegram message for when a student submits payment proof.
 * Sent to admins so they know to review it.
 */
export function buildProofSubmittedMessage(order) {
  const shortId  = order.id.slice(0, 8).toUpperCase()
  const customer = order.profiles?.full_name || order.customer_name || 'Unknown'
  const phone    = order.phone || order.profiles?.phone || 'N/A'
  const email    = order.profiles?.email || 'N/A'
  const total    = Number(order.total).toLocaleString('en-NG', { minimumFractionDigits: 0 })
  const delivery = order.delivery_address || 'Not provided'
  const adminUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
    : 'your admin dashboard'

  return [
    '📎 <b>Payment Proof Submitted!</b>',
    '',
    `<b>Order ID:</b>  #${shortId}`,
    '',
    '👤 <b>Buyer Details</b>',
    `<b>Name:</b>     ${customer}`,
    `<b>Phone:</b>    ${phone}`,
    `<b>Email:</b>    ${email}`,
    '',
    `<b>Amount:</b>   ₦${total}`,
    '',
    '📍 <b>Delivery Address</b>',
    delivery,
    '',
    '<i>Please review the proof and confirm or reject the payment.</i>',
    '',
    `<a href="${adminUrl}">🔗 Review in Admin Dashboard →</a>`,
  ].join('\n')
}
