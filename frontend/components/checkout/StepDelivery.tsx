'use client'

/**
 * StepDelivery — Phase 7
 *
 * Checkout step 1: student enters delivery / pickup details.
 * - Full name, phone, delivery method (Campus Pickup | Home Delivery)
 * - If Home Delivery: shows address field
 * - Gold focus ring on inputs, sharp corners, no border-radius
 * - Inline CSS only — no Tailwind utility classes
 */

import { useState } from 'react'
import { MapPin, Phone, User } from 'lucide-react'

export interface DeliveryData {
  fullName:       string
  phone:          string
  method:         'pickup' | 'delivery'
  address:        string
}

interface Props {
  data:     DeliveryData
  onChange: (data: DeliveryData) => void
  onNext:   () => void
}

const inputBase: React.CSSProperties = {
  width:           '100%',
  height:          '52px',
  padding:         '0 16px',
  background:      'var(--bg-surface)',
  border:          '1px solid var(--border)',
  color:           'var(--text-primary)',
  fontFamily:      'var(--font-body)',
  fontSize:        '14px',
  outline:         'none',
  boxSizing:       'border-box' as const,
  transition:      'border-color 150ms',
}

function Field({
  label, icon, value, onChange, placeholder, type = 'text',
}: {
  label: string; icon: React.ReactNode; value: string
  onChange: (v: string) => void; placeholder: string; type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ color: '#3DBA6F' }}>{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase,
          borderColor: focused ? '#3DBA6F' : 'var(--border)',
        }}
      />
    </div>
  )
}

export default function StepDelivery({ data, onChange, onNext }: Props) {
  const set = (key: keyof DeliveryData) => (val: string) =>
    onChange({ ...data, [key]: val })

  const isValid =
    data.fullName.trim().length >= 2 &&
    data.phone.trim().length    >= 7 &&
    (data.method === 'pickup' || data.address.trim().length >= 5)

  const methodBtn = (value: 'pickup' | 'delivery', label: string): React.CSSProperties => ({
    flex:           1,
    minHeight:      '52px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '8px',
    fontFamily:     'var(--font-body)',
    fontSize:       '12px',
    fontWeight:     700,
    letterSpacing:  '0.12em',
    textTransform:  'uppercase' as const,
    cursor:         'pointer',
    border:         data.method === value ? '1px solid #3DBA6F' : '1px solid var(--border)',
    background:     data.method === value ? 'rgba(201,168,76,0.10)' : 'var(--bg-surface)',
    color:          data.method === value ? '#3DBA6F' : 'var(--text-muted)',
    transition:     'border-color 150ms, background 150ms, color 150ms',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <Field
        label="Full Name"
        icon={<User size={11} />}
        value={data.fullName}
        onChange={set('fullName')}
        placeholder="e.g. Chukwuemeka Obi"
      />

      <Field
        label="Phone Number"
        icon={<Phone size={11} />}
        value={data.phone}
        onChange={set('phone')}
        placeholder="e.g. 08012345678"
        type="tel"
      />

      {/* Delivery method toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{
          fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '6px', margin: 0,
        }}>
          <span style={{ color: '#3DBA6F' }}><MapPin size={11} /></span>
          Delivery Method
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={methodBtn('pickup', 'Campus Pickup')} onClick={() => set('method')('pickup')}>
            🏛 Campus Pickup
          </button>
          <button style={methodBtn('delivery', 'Home Delivery')} onClick={() => set('method')('delivery')}>
            🚚 Home Delivery
          </button>
        </div>
      </div>

      {data.method === 'delivery' && (
        <Field
          label="Delivery Address"
          icon={<MapPin size={11} />}
          value={data.address}
          onChange={set('address')}
          placeholder="Street, area, city"
        />
      )}

      <button
        onClick={onNext}
        disabled={!isValid}
        style={{
          width:          '100%',
          minHeight:      '52px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     isValid ? '#3DBA6F' : 'var(--bg-elevated)',
          border:         'none',
          color:          isValid ? '#0A0A0A' : 'var(--text-muted)',
          fontFamily:     'var(--font-body)',
          fontSize:       '13px',
          fontWeight:     700,
          letterSpacing:  '0.15em',
          textTransform:  'uppercase',
          cursor:         isValid ? 'pointer' : 'not-allowed',
          transition:     'background 200ms, color 200ms',
          marginTop:      '8px',
        }}
      >
        Continue to Payment →
      </button>
    </div>
  )
}
