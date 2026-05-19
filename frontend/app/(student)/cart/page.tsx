import type { Metadata } from 'next'
import CartClient from '@/components/cart/CartClient'

export const metadata: Metadata = {
  title: 'Cart — TACSFON Merch',
  description: 'Review your cart items and proceed to checkout.',
}

export default function CartPage() {
  return <CartClient />
}