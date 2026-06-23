'use client'

/**
 * StepPayment — Phase 7
 *
 * Checkout step 2: shows bank transfer details + order total.
 * - Bank details in a dark card with copy-to-clipboard (gold icon)
 * - Order summary: items, subtotal, method fee, grand total
 * - Inline CSS only — no Tailwind utility classes
 */

import { useState }  from 'react'
import { Copy, Check, Landmark } from 'lucide-react'
import { BANK_CONFIG }           from '@/lib/config/bank'
import { formatPrice }           from '@/lib/utils/formatters'

interface CartItem {
  id:       string
  quantity: number
  product?: { name: string }
  variant?: { price_override?: number | null; size?: string | null; color?: string | null }
  unit_price: number
}

interface Props {
  cartItems:  CartItem[]
  subtotal:   number
  method:     'pickup' | 'delivery'
  onNext:     () => void
  onBack:     () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    
  }
  return (
    <button
      onClick={handle}
      title="Copy"
      style={{
        background: 'transparent',
        border:     'none',
        cursor:     'pointer',
        color:      copied ? 'var(--success)' : '#3DBA6F',
        display:    'flex',
        alignItems: 'center',
        padding:    '4px',
        flexShrink: 0,
        transition: 'color 150ms',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {value}
        </span>
        <CopyButton text={value} />
      </div>
    </div>
  )
}

export default function StepPayment({ cartItems, subtotal, method, onNext, onBack }: Props) {
  const deliveryFee = method === 'delivery' ? 500 : 0
  const total       = subtotal + deliveryFee

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Bank details card */}
      <div style={{
        background: 'var(--bg-surface)',
        border:     '1px solid var(--border)',
        padding:    '20px',
      }}>
        <div style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '10px',
          marginBottom:  '16px',
        }}>
          <span style={{ color: '#3DBA6F' }}><Landmark size={16} /></span>
          <p style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '11px',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
            margin:        0,
          }}>
            Bank Transfer Details
          </p>
        </div>

        <BankRow label="Bank"           value={BANK_CONFIG.bankName}    />
        <BankRow label="Account Number" value={BANK_CONFIG.accountNumber} />
        <BankRow label="Account Name"   value={BANK_CONFIG.accountName}  />
        <BankRow label="Amount"         value={formatPrice(total)}       />

        <p style={{
          marginTop:  '16px',
          fontSize:   '12px',
          fontFamily: 'var(--font-body)',
          color:      'var(--text-muted)',
          lineHeight: 1.6,
          margin:     '16px 0 0 0',
        }}>
          Transfer the exact amount shown above. You will upload your proof of payment in the next step.
        </p>
      </div>

      {/* Order summary */}
      <div style={{
        background: 'var(--bg-surface)',
        border:     '1px solid var(--border)',
        padding:    '20px',
      }}>
        <p style={{
          fontFamily:    'var(--font-body)',
          fontSize:      '10px',
          fontWeight:    700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         'var(--text-muted)',
          marginBottom:  '16px',
          margin:        '0 0 16px 0',
        }}>
          Order Summary
        </p>

        {cartItems.map(item => {
          const variantLabel = [item.variant?.size, item.variant?.color]
            .filter(Boolean).join(' / ')
          return (
            <div key={item.id} style={{
              display:       'flex',
              justifyContent:'space-between',
              alignItems:    'flex-start',
              padding:       '8px 0',
              borderBottom:  '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  {item.product?.name ?? 'Product'} × {item.quantity}
                </p>
                {variantLabel && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    {variantLabel}
                  </p>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, marginLeft: '16px' }}>
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          )
        })}

        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
              {method === 'delivery' ? 'Delivery Fee' : 'Campus Pickup'}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)' }}>
              {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}
            </span>
          </div>
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 700, color: '#3DBA6F' }}>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{
            flex:           '0 0 auto',
            minHeight:      '52px',
            padding:        '0 24px',
            background:     'var(--bg-surface)',
            border:         '1px solid var(--border)',
            color:          'var(--text-muted)',
            fontFamily:     'var(--font-body)',
            fontSize:       '12px',
            fontWeight:     700,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            cursor:         'pointer',
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          style={{
            flex:           1,
            minHeight:      '52px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            background:     '#3DBA6F',
            border:         'none',
            color:          '#0A0A0A',
            fontFamily:     'var(--font-body)',
            fontSize:       '13px',
            fontWeight:     700,
            letterSpacing:  '0.15em',
            textTransform:  'uppercase',
            cursor:         'pointer',
          }}
        >
          I've Paid — Upload Proof →
        </button>
      </div>
    </div>
  )
}
