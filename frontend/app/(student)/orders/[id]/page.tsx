import type { Metadata } from 'next'
import OrderDetailClient from '@/components/orders/OrderDetailClient'

export const metadata: Metadata = {
  title: 'Order Detail — TACSFON Merch',
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <OrderDetailClient orderId={params.id} />
}