/**
 * lib/receipts/generateReceipt.js
 *
 * Generates a PDF receipt for a confirmed order using pdfkit.
 * Returns a Buffer of the PDF bytes.
 *
 * FIX: total_amount → total | delivery_method fallback removed
 */
import PDFDocument from 'pdfkit'

/**
 * @param {object} order - full order with items, variants, products, profile
 * @returns {Promise<Buffer>}
 */
export function generateReceiptPDF(order) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks = []

    doc.on('data',  (chunk) => chunks.push(chunk))
    doc.on('end',   ()      => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const shortId = order.id.slice(0, 8).toUpperCase()
    const dateStr = new Date(order.created_at).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    // ── Header ───────────────────────────────────────────────────────────
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('TACSFON Merch Store', { align: 'center' })

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Order Receipt', { align: 'center' })

    doc.moveDown(1.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(1)

    // ── Order Meta ───────────────────────────────────────────────────────
    // FIX: removed delivery_method fallback — use delivery_address only
    const meta = [
      ['Order ID',  `#${shortId}`],
      ['Date',      dateStr],
      ['Customer',  order.profiles?.full_name || 'N/A'],
      ['Email',     order.profiles?.email     || 'N/A'],
      ['Delivery',  order.delivery_address    || 'N/A'],
    ]

    for (const [label, value] of meta) {
      doc
        .font('Helvetica-Bold').fontSize(11).text(`${label}:`, { continued: true, width: 150 })
        .font('Helvetica').text(`  ${value}`)
    }

    doc.moveDown(1.5)

    // ── Items Table Header ────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(11)
    doc.text('Item',    50,  doc.y, { width: 220, continued: false })
    const tableTop = doc.y - doc.currentLineHeight()
    doc.text('Variant', 270, tableTop, { width: 120 })
    doc.text('Qty',     390, tableTop, { width: 50 })
    doc.text('Price',   440, tableTop, { width: 80, align: 'right' })
    doc.moveDown(0.3)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.5)

    // ── Items ─────────────────────────────────────────────────────────────
    doc.font('Helvetica').fontSize(10)

    for (const item of order.order_items || []) {
      const name    = item.product_variants?.products?.name || 'Product'
      const size    = item.product_variants?.size  || ''
      const color   = item.product_variants?.color || ''
      const variant = [size, color].filter(Boolean).join(' / ') || '—'
      const price   = `₦${Number(item.unit_price * item.quantity).toLocaleString('en-NG')}`
      const rowY    = doc.y

      doc.text(name,    50,  rowY, { width: 220 })
      doc.text(variant, 270, rowY, { width: 120 })
      doc.text(String(item.quantity), 390, rowY, { width: 50 })
      doc.text(price,   440, rowY, { width: 80, align: 'right' })
      doc.moveDown(0.8)
    }

    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.8)

    // ── Totals ────────────────────────────────────────────────────────────
    // FIX: total_amount → total
    const totalStr = `₦${Number(order.total).toLocaleString('en-NG')}`

    doc.font('Helvetica').fontSize(11)
    doc.text('Delivery:', 390, doc.y, { width: 70 })
    doc.text('Free',      460, doc.y - doc.currentLineHeight(), { width: 80, align: 'right' })
    doc.moveDown(0.5)

    doc.font('Helvetica-Bold').fontSize(12)
    doc.text('Total Paid:', 390, doc.y, { width: 70 })
    doc.text(totalStr,      460, doc.y - doc.currentLineHeight(), { width: 80, align: 'right' })

    doc.moveDown(2)

    // ── Footer ────────────────────────────────────────────────────────────
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#888888')
      .text('Thank you for supporting TACSFON!', { align: 'center' })
      .text('This is an automatically generated receipt.', { align: 'center' })

    doc.end()
  })
}
