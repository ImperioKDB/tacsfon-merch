'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, ChevronLeft, Package } from 'lucide-react'
import { getBankDetails, FALLBACK_BANK_DETAILS } from '@/lib/config/bank'
import type { BankDetails, Cart } from '@/types'
import type { DeliveryData } from './CheckoutClient'

interface Props {
  deliveryData:   DeliveryData
  cart:           Cart
  onOrderCreated: (orderId: string) => void
  onBack:         () => void
}

/** Format Nigerian naira */
function naira(n: number) {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

export default function StepPayment({ deliveryData, cart, onOrderCreated, onBack }: Props) {
  const [bank,     setBank]     = useState<BankDetails>(FALLBACK_BANK_DETAILS)
  const [copied,   setCopied]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Try to load bank details from endpoint; fallback is already in state
  useEffect(() => {
    getBankDetails().then(setBank)
  }, [])

  const total = cart.items.reduce((sum, it) => {
    const price = it.variant?.price_override ?? it.variant?.product?.base_price ?? 0
    return sum + price * it.quantity
  }, 0)

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(bank.account_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked — silently ignore */
    }
  }

  async function handleTransferDone() {
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_address: deliveryData.deliveryAddress,
          phone:            deliveryData.phone,
        }),
      })
      const body = await res.json()
      if (body?.success && body?.data?.id) {
        onOrderCreated(body.data.id)
      } else {
        setApiError(body?.error?.message ?? 'Failed to create order. Please try again.')
      }
    } catch {
      setApiError('Connection issue. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const rowLabel = { color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }
  const rowValue = { color: 'var(--color-text-primary)',   fontSize: '0.875rem', fontWeight: 600 }

  return (
    <div className="space-y-5">

      {/* Bank transfer box */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}
        >
          Bank Transfer Details
        </h2>

        <div className="space-y-3">
          {[
            { label: 'Bank',         value: bank.bank_name     },
            { label: 'Account Name', value: bank.account_name  },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span style={rowLabel}>{label}</span>
              <span style={rowValue}>{value}</span>
            </div>
          ))}

          {/* Account number row with copy button */}
          <div className="flex justify-between items-center">
            <span style={rowLabel}>Account No.</span>
            <div className="flex items-center gap-2">
              <span style={{ ...rowValue, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {bank.account_number}
              </span>
              <button
                onClick={copyAccountNumber}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold
                           transition-all hover:opacity-80 active:scale-95"
                style={{
                  background: copied ? 'var(--color-success)' : 'var(--color-gold-muted)',
                  color:      copied ? '#fff' : 'var(--color-gold)',
                  border:     '1px solid',
                  borderColor: copied ? 'var(--color-success)' : 'var(--color-gold)',
                }}
              >
                {copied
                  ? <><Check size={12} /> Copied</>
                  : <><Copy size={12} /> Copy</>
                }
              </button>
            </div>
          </div>

          {/* Amount */}
          <div
            className="flex justify-between items-center pt-3 mt-1"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span style={rowLabel}>Amount to Transfer</span>
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--color-gold)', fontFamily: 'Urbanist, sans-serif' }}
            >
              {naira(total)}
            </span>
          </div>
        </div>

        {/* Instruction */}
        <div
          className="rounded-xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: 'var(--color-gold-muted)', color: 'var(--color-gold)', border: '1px solid var(--color-gold)' }}
        >
          ⚠️ <strong>Important:</strong> Include your full name as the payment narration/description
          so we can match your transfer to your order.
        </div>
      </div>

      {/* Order summary (collapsed) */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Package size={15} style={{ color: 'var(--color-text-secondary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Order Summary
          </h3>
        </div>

        {cart.items.map(item => {
          const price = item.variant?.price_override ?? item.variant?.product?.base_price ?? 0
          const name  = item.variant?.product?.name ?? 'Product'
          const size  = item.variant?.size  ? ` / ${item.variant.size}`  : ''
          const color = item.variant?.color ? ` / ${item.variant.color}` : ''
          return (
            <div key={item.id} className="flex justify-between items-start text-sm">
              <span style={{ color: 'var(--color-text-secondary)', maxWidth: '65%' }}>
                {name}{size}{color}
                <span className="ml-1 text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                  ×{item.quantity}
                </span>
              </span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {naira(price * item.quantity)}
              </span>
            </div>
          )
        })}

        <div
          className="flex justify-between items-center pt-3 font-bold"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-text-primary)' }}>Total</span>
          <span style={{ color: 'var(--color-gold)' }}>{naira(total)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: 'var(--color-text-secondary)' }}>Delivery</span>
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free</span>
        </div>
      </div>

      {/* Error message */}
      {apiError && (
        <p className="text-sm px-1" style={{ color: 'var(--color-error)' }}>
          {apiError}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1 px-5 py-3.5 rounded-xl text-sm font-semibold
                     transition-all hover:opacity-80 disabled:opacity-40"
          style={{
            background:  'var(--color-surface-2)',
            color:       'var(--color-text-secondary)',
            border:      '1px solid var(--color-border)',
            whiteSpace:  'nowrap',
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <button
          onClick={handleTransferDone}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all
                     hover:opacity-90 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-gold)', color: '#000' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"
              />
              Creating Order…
            </span>
          ) : (
            'I Have Made the Transfer →'
          )}
        </button>
      </div>
    </div>
  )
}