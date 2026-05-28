'use client'

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import StepDelivery    from './StepDelivery'
import StepPayment     from './StepPayment'
import StepUploadProof from './StepUploadProof'
import type { Cart, Profile } from '@/types'
import { apiFetch } from '@/lib/api/fetch'

// ── Types ────────────────────────────────────────────────────────────────────

export interface DeliveryData {
  fullName:        string
  phone:           string
  deliveryAddress: string
}

type Step = 1 | 2 | 3

// ── Progress bar ─────────────────────────────────────────────────────────────

const STEPS = ['Delivery', 'Payment', 'Upload Proof'] as const

function ProgressBar({ current }: { current: Step }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        {/* connector line behind nodes */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
          style={{ background: 'var(--color-border)' }}
        />
        {STEPS.map((label, i) => {
          const n        = (i + 1) as Step
          const done     = current > n
          const active   = current === n
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done || active
                    ? 'var(--color-gold)'
                    : 'var(--color-surface-2)',
                  border: active
                    ? '2px solid var(--color-gold-light)'
                    : '2px solid var(--color-border)',
                  color: done || active ? '#000' : 'var(--color-text-disabled)',
                  boxShadow: active ? '0 0 0 4px var(--color-gold-muted)' : 'none',
                }}
              >
                {done ? '✓' : n}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{
                  color: active
                    ? 'var(--color-gold)'
                    : done
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-text-disabled)',
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <main
      className="min-h-screen px-4 py-12 flex flex-col items-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-lg space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded-xl mx-auto" style={{ background: 'var(--color-surface-2)' }} />
        <div className="h-px w-full"                 style={{ background: 'var(--color-border)'   }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-2xl" style={{ background: 'var(--color-surface)' }} />
        ))}
        <div className="h-14 rounded-2xl"            style={{ background: 'var(--color-surface)' }} />
      </div>
    </main>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CheckoutClient() {
  const router = useRouter()

  const [step,         setStep]         = useState<Step>(1)
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [cart,         setCart]         = useState<Cart   | null>(null)
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null)
  const [orderId,      setOrderId]      = useState<string | null>(null)
  const [loading,      setLoading]      = useState(true)

  // ── Bootstrap: fetch profile + cart in parallel ───────────────────────────
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const [profileRes, cartRes] = await Promise.all([
          apiFetch('/auth/profile').then(data => ({ success: true, data })).catch(() => ({ success: false })),
          apiFetch('/cart').then(data => ({ success: true, data })).catch(() => ({ success: false })),
        ])

        const [profileBody, cartBody] = [profileRes, cartRes]

        if (cancelled) return

        if (cartBody?.success && 'data' in cartBody) {
          const c: Cart = (cartBody as any).data
          // Guard: empty cart → back to cart page
          if (!c?.items?.length) {
            router.replace('/cart')
            return
          }
          setCart(c)
        } else {
          router.replace('/cart')
          return
        }

        if (profileBody?.success) {
          setProfile(profileBody.data as Profile)
        }
      } catch {
        // If anything explodes, fall through — steps handle null gracefully
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => { cancelled = true }
  }, [router])

  // ── Step handlers ─────────────────────────────────────────────────────────

  function handleDeliveryComplete(data: DeliveryData) {
    setDeliveryData(data)
    setStep(2)
  }

  function handleOrderCreated(id: string) {
    setOrderId(id)
    setStep(3)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <CheckoutSkeleton />

  return (
    <main
      className="min-h-screen px-4 py-12 flex flex-col items-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-lg">

        {/* Page heading */}
        <h1
          className="text-2xl font-bold mb-8 text-center"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}
        >
          Checkout
        </h1>

        <ProgressBar current={step} />

        {step === 1 && (
          <StepDelivery
            profile={profile}
            onComplete={handleDeliveryComplete}
          />
        )}

        {step === 2 && deliveryData && cart && (
          <StepPayment
            deliveryData={deliveryData}
            cart={cart}
            onOrderCreated={handleOrderCreated}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && orderId && (
          <StepUploadProof orderId={orderId} />
        )}

      </div>
    </main>
  )
}