'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StepDelivery from './StepDelivery'
import StepPayment from './StepPayment'
import StepUploadProof from './StepUploadProof'
import { apiFetch } from '@/lib/api/fetch'

export default function CheckoutClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<any>(null)
  const [cart, setCart] = useState<any>(null)
  const [deliveryData, setDeliveryData] = useState<any>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [p, c] = await Promise.all([apiFetch<any>('/auth/profile'), apiFetch<any>('/cart')])
        if (!c?.items?.length) { router.replace('/cart'); return; }
        setProfile(p); setCart(c);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    bootstrap()
  }, [router])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold italic font-bold">SECURE CONNECTION...</div>

  return (
    <main className="min-h-screen px-4 py-24" style={{ background: 'black' }}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-12 text-center">Checkout</h1>
        {step === 1 && <StepDelivery profile={profile} onComplete={(d: any) => { setDeliveryData(d); setStep(2); }} />}
        {step === 2 && <StepPayment deliveryData={deliveryData} cart={cart} onOrderCreated={(id: string) => { setOrderId(id); setStep(3); }} onBack={() => setStep(1)} />}
        {step === 3 && orderId && <StepUploadProof orderId={orderId} />}
      </div>
    </main>
  )
}
