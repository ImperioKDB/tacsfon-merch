import type { Metadata } from 'next'
import CheckoutClient from '@/components/checkout/CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout — TACSFON Merch',
  description: 'Complete your order with bank transfer.',
}

export default function CheckoutPage() {
  return <CheckoutClient />
}