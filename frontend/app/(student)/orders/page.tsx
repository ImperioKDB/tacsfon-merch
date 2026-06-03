import OrdersClient from '@/components/orders/OrdersClient'

export const metadata = {
  title: 'My Orders — TACSFON Merch',
}

export default function OrdersPage() {
  return (
    <div style={{
      maxWidth:   '680px',
      margin:     '0 auto',
      padding:    '24px 16px 96px',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin:        '0 0 4px',
          fontFamily:    'var(--font-display)',
          fontSize:      '28px',
          letterSpacing: '0.08em',
          color:         'var(--text-primary)',
        }}>
          MY ORDERS
        </h1>
        <p style={{
          margin:     0,
          fontFamily: 'var(--font-body)',
          fontSize:   '13px',
          color:      'var(--text-muted)',
        }}>
          Track and manage your orders
        </p>
      </div>

      <OrdersClient />
    </div>
  )
}
