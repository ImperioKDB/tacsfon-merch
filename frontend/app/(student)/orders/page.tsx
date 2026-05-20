import type { Metadata } from 'next'
import OrdersClient from '@/components/orders/OrdersClient'

export const metadata: Metadata = {
  title: 'My Orders — TACSFON Merch',
  description: 'Track all your TACSFON merch orders.',
}

export default function OrdersPage() {
  return <OrdersClient />
}