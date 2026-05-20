import { formatCurrency } from '@/lib/utils/formatters';

interface OrderItem {
  id: string;
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface ReceiptData {
  order_id: string;
  date: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  receipt_url: string | null;
  payment_confirmed: boolean;
}

interface ReceiptPreviewProps {
  receipt: ReceiptData;
}

export default function ReceiptPreview({ receipt }: ReceiptPreviewProps) {
  const formattedDate = new Date(receipt.date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shortOrderId = receipt.order_id.slice(0, 8).toUpperCase();

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-lg"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Receipt Header */}
      <div
        className="px-8 py-7"
        style={{ background: '#0A0A0F', borderBottom: '3px solid #C9A84C' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: '#C9A84C', fontFamily: 'var(--font-urbanist)' }}
            >
              TACSFON Merch Store
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#A09C94' }}>
              Official Receipt
            </p>
          </div>
          {/* Gold dot logo mark */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm"
            style={{ background: '#C9A84C' }}
          >
            TM
          </div>
        </div>
      </div>

      {/* Order Meta */}
      <div
        className="px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
            Order ID
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#111827' }}>
            #{shortOrderId}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
            Date
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#111827' }}>
            {formattedDate}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
            Customer
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#111827' }}>
            {receipt.customer_name}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-8 py-6">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
              <th
                className="text-left pb-3 font-semibold uppercase tracking-wide text-xs"
                style={{ color: '#6B7280' }}
              >
                Item
              </th>
              <th
                className="text-center pb-3 font-semibold uppercase tracking-wide text-xs"
                style={{ color: '#6B7280' }}
              >
                Qty
              </th>
              <th
                className="text-right pb-3 font-semibold uppercase tracking-wide text-xs"
                style={{ color: '#6B7280' }}
              >
                Unit Price
              </th>
              <th
                className="text-right pb-3 font-semibold uppercase tracking-wide text-xs"
                style={{ color: '#6B7280' }}
              >
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: idx < receipt.items.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <td className="py-3 pr-4">
                  <p className="font-medium" style={{ color: '#111827' }}>
                    {item.product_name}
                  </p>
                  {item.variant_label && (
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                      {item.variant_label}
                    </p>
                  )}
                </td>
                <td className="py-3 text-center" style={{ color: '#374151' }}>
                  {item.quantity}
                </td>
                <td className="py-3 text-right" style={{ color: '#374151' }}>
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-3 text-right font-medium" style={{ color: '#111827' }}>
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          className="mt-4 pt-4 space-y-2"
          style={{ borderTop: '1px solid #E5E7EB' }}
        >
          <div className="flex justify-between text-sm" style={{ color: '#6B7280' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(receipt.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: '#059669' }}>
            <span>Delivery</span>
            <span className="font-medium">Free</span>
          </div>
          <div
            className="flex justify-between text-base font-bold pt-2"
            style={{
              color: '#111827',
              borderTop: '2px solid #C9A84C',
              marginTop: '8px',
              paddingTop: '10px',
            }}
          >
            <span>Total</span>
            <span style={{ color: '#C9A84C' }}>{formatCurrency(receipt.total)}</span>
          </div>
        </div>
      </div>

      {/* Receipt Footer */}
      <div
        className="px-8 py-5 text-center"
        style={{
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <p className="text-sm font-medium" style={{ color: '#374151' }}>
          Thank you for supporting TACSFON 🙏
        </p>
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
          For enquiries, contact us via WhatsApp.
        </p>
      </div>
    </div>
  );
}