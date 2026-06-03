'use client'

/**
 * CheckoutClient — Phase 7
 *
 * Orchestrates the 3-step checkout flow:
 *   Step 1 — Delivery details  (StepDelivery)
 *   Step 2 — Payment info      (StepPayment)
 *   Step 3 — Upload proof      (StepUploadProof)
 *
 * - Creates the backend order at the start of Step 3
 * - Progress indicator: gold active dot, muted future steps
 * - Inline CSS only — no Tailwind utility classes
 */

'use client'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { toast }             from 'sonner'
import StepDelivery, { type DeliveryData } from './StepDelivery'
import StepPayment           from './StepPayment'
import StepUploadProof       from './StepUploadProof'
import { apiFetch }          from '@/lib/api/fetch'

interface CartItem {
  id:          string
  quantity:    number
  unit_price:  number
  product?:    { name: string }
  variant?:    { price_override?: number | null; size?: string | null; color?: string | null }
}

interface Props {
  cartItems: CartItem[]
  subtotal:  number
}

const STEPS = ['Delivery', 'Payment', 'Upload Proof'] as const
type StepIndex = 0 | 1 | 2

export default function CheckoutClient({ cartItems, subtotal }: Props) {
  const router = useRouter()

  const [step,     setStep]    = useState<StepIndex>(0)
  const [orderId,  setOrderId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [delivery, setDelivery] = useState<DeliveryData>({
    fullName: '',
    phone:    '',
    method:   'pickup',
    address:  '',
  })

  const goNext = async () => {
    if (step === 1) {
      // Create the order before going to upload step
      setCreating(true)
      try {
        const res = await apiFetch('/orders', {
          method: 'POST',
          body:   JSON.stringify({
            delivery_method:  delivery.method,
            delivery_address: delivery.address || null,
            contact_name:     delivery.fullName,
            contact_phone:    delivery.phone,
          }),
        })
        setOrderId(res.data?.id ?? res.id)
        setStep(2)
      } catch (e: any) {
        toast.error(e.message || 'Failed to create order. Please try again.')
      } finally {
        setCreating(false)
      }
      return
    }
    setStep(s => Math.min(s + 1, 2) as StepIndex)
  }

  const goBack = () => setStep(s => Math.max(s - 1, 0) as StepIndex)

  const onDone = () => router.push('/orders')

  return (
    <div style={{
      minHeight:   '100vh',
      background:  'var(--bg-base)',
      padding:     'clamp(24px, 5vw, 64px) clamp(16px, 5vw, 32px)',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Page title */}
        <h1 style={{
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(36px, 6vw, 56px)',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color:         'var(--text-primary)',
          margin:        '0 0 40px 0',
          lineHeight:    0.95,
        }}>
          Checkout
        </h1>

        {/* Step indicator */}
        <div style={{
          display:       'flex',
          alignItems:    'center',
          marginBottom:  '48px',
          gap:           0,
        }}>
          {STEPS.map((label, i) => {
            const isActive    = i === step
            const isCompleted = i < step
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width:      '10px',
                    height:     '10px',
                    borderRadius: '50%',
                    background:  isCompleted ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                    border:      isActive ? '2px solid var(--accent)' : isCompleted ? 'none' : '2px solid var(--border)',
                    boxShadow:   isActive ? '0 0 0 3px rgba(201,168,76,0.25)' : 'none',
                    transition:  'all 200ms ease',
                    flexShrink:  0,
                  }} />
                  <span style={{
                    fontSize:      '9px',
                    fontFamily:    'var(--font-body)',
                    fontWeight:    700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color:         isActive ? 'var(--accent)' : isCompleted ? 'var(--text-muted)' : 'var(--bg-elevated)',
                    whiteSpace:    'nowrap',
                    transition:    'color 200ms',
                  }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex:       1,
                    height:     '1px',
                    background: isCompleted ? 'var(--accent)' : 'var(--border)',
                    marginBottom: '16px',
                    marginLeft:  '8px',
                    marginRight: '8px',
                    transition:  'background 200ms',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Steps */}
        {step === 0 && (
          <StepDelivery
            data={delivery}
            onChange={setDelivery}
            onNext={goNext}
          />
        )}

        {step === 1 && (
          <StepPayment
            cartItems={cartItems}
            subtotal={subtotal}
            method={delivery.method}
            onNext={creating ? () => {} : goNext}
            onBack={goBack}
          />
        )}

        {step === 2 && orderId && (
          <StepUploadProof
            orderId={orderId}
            onDone={onDone}
            onBack={goBack}
          />
        )}

        {creating && (
          <div style={{
            position:       'fixed',
            inset:          0,
            zIndex:         200,
            background:     'rgba(10,10,10,0.7)',
            backdropFilter: 'blur(4px)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <p style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '14px',
              fontWeight:    600,
              letterSpacing: '0.08em',
              color:         'var(--text-primary)',
              textTransform: 'uppercase',
            }}>
              Creating order…
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
