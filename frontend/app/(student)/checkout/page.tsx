import { cookies }        from 'next/headers'
import { redirect }       from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import CheckoutClient     from '@/components/checkout/CheckoutClient'

interface CartItem {
  id:         string
  quantity:   number
  unit_price: number
  product?:   { name: string }
  variant?:   { price_override?: number | null; size?: string | null; color?: string | null }
}

async function getCart(): Promise<{ items: CartItem[]; subtotal: number }> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? ''
  const cookieStore = cookies()

  // Build a temporary Supabase client just to read the session cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  try {
    const res = await fetch(`${API}/api/cart`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) return { items: [], subtotal: 0 }

    const json = await res.json()
    // Support both { data: { items } } and { items } shapes
    const items: CartItem[] = json?.data?.items ?? json?.items ?? []

    if (items.length === 0) redirect('/cart')   // nothing to check out

    const subtotal = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    )
    return { items, subtotal }
  } catch {
    return { items: [], subtotal: 0 }
  }
}

export default async function CheckoutPage() {
  const { items, subtotal } = await getCart()

  return (
    <CheckoutClient
      cartItems={items}
      subtotal={subtotal}
    />
  )
}
