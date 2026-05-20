'use client'

import { useState } from 'react'
import type { Profile } from '@/types'
import type { DeliveryData } from './CheckoutClient'

interface Props {
  profile:    Profile | null
  onComplete: (data: DeliveryData) => void
}

interface FieldErrors {
  fullName?:        string
  phone?:           string
  deliveryAddress?: string
}

export default function StepDelivery({ profile, onComplete }: Props) {
  const [fullName,        setFullName]        = useState(profile?.full_name ?? '')
  const [phone,           setPhone]           = useState(profile?.phone     ?? '')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [errors,          setErrors]          = useState<FieldErrors>({})

  function validate(): boolean {
    const e: FieldErrors = {}
    if (!fullName.trim())        e.fullName        = 'Full name is required.'
    if (!phone.trim())           e.phone           = 'Phone number is required.'
    if (!deliveryAddress.trim()) e.deliveryAddress = 'Delivery address is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onComplete({
      fullName:        fullName.trim(),
      phone:           phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
    })
  }

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all'
  const inputStyle = {
    background:  'var(--color-surface)',
    border:      '1.5px solid var(--color-border)',
    color:       'var(--color-text-primary)',
  }
  const inputFocusClass = 'focus:ring-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]'
  const labelStyle = { color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }
  const errorStyle = { color: 'var(--color-error)',          fontSize: '0.75rem'   }

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-lg font-semibold"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}
      >
        Delivery Details
      </h2>

      {/* Full name */}
      <div className="space-y-1.5">
        <label className="block font-medium" style={labelStyle}>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          onBlur={validate}
          placeholder="e.g. Amaka Johnson"
          className={`${inputBase} ${inputFocusClass}`}
          style={inputStyle}
        />
        {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="block font-medium" style={labelStyle}>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onBlur={validate}
          placeholder="e.g. 08012345678"
          className={`${inputBase} ${inputFocusClass}`}
          style={inputStyle}
        />
        {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
      </div>

      {/* Delivery address */}
      <div className="space-y-1.5">
        <label className="block font-medium" style={labelStyle}>
          Delivery Address
          <span className="ml-1" style={{ color: 'var(--color-text-disabled)', fontWeight: 400 }}>
            (hostel name, room, street)
          </span>
        </label>
        <textarea
          rows={3}
          value={deliveryAddress}
          onChange={e => setDeliveryAddress(e.target.value)}
          onBlur={validate}
          placeholder="e.g. Block C, Room 12, Amina Hall, FUTA"
          className={`${inputBase} ${inputFocusClass} resize-none`}
          style={inputStyle}
        />
        {errors.deliveryAddress && <p style={errorStyle}>{errors.deliveryAddress}</p>}
      </div>

      {/* Continue */}
      <button
        onClick={handleSubmit}
        className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all
                   hover:opacity-90 active:scale-[.98]"
        style={{ background: 'var(--color-gold)', color: '#000' }}
      >
        Continue →
      </button>
    </div>
  )
}