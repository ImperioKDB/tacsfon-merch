/**
 * lib/telegram/orderMessage.js
 *
 * Builds the Telegram HTML message for a new online order.
 *
 * FIX: total_amount → total | delivery_method fallback removed
 *
 * @param {object} order  - order with items, profile, variants, products
 * @returns {string}      - HTML-formatted Telegram message
 */
export function buildNewOrderMessage(order) {
  const shortId  = order.id.slice(0, 8).toUpperCase()
  const customer = order.profiles?.full_name || 'Unknown'
  const phone    = order.phone || order.profiles?.phone || 'N/A'
  // FIX: total_amount → total
  const total    = Number(order.total).toLocaleString('en-NG')
  // FIX: delivery_method fallback removed
  const delivery = order.delivery_address || 'N/A'
  const adminUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
    : 'your admin dashboard'

  const itemLines = (order.order_items || []).map((item) => {
    const name    = item.product_variants?.products?.name || 'Product'
    const size    = item.product_variants?.size  || ''
    const color   = item.product_variants?.color || ''
    const variant = [size, color].filter(Boolean).join('/')
    const qty     = item.quantity
    return `  • ${name}${variant ? ` (${variant})` : ''} x${qty}`
  }).join('\n')

  return [
    '🛍️ <b>New Merch Order!</b>',
    '',
    `<b>Order ID:</b> #${shortId}`,
    `<b>Customer:</b> ${customer}`,
    `<b>Phone:</b> ${phone}`,
    '<b>Items:</b>',
    itemLines,
    '',
    `<b>Total:</b> ₦${total}`,
    `<b>Delivery to:</b> ${delivery}`,
    '',
    `<a href="${adminUrl}">View in admin dashboard →</a>`,
  ].join('\n')
}
