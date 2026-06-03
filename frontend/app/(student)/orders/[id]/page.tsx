import OrderDetailClient from '@/components/orders/OrderDetailClient'

interface Props {
  params: { id: string }
}

export default function OrderDetailPage({ params }: Props) {
  return <OrderDetailClient orderId={params.id} />
}
