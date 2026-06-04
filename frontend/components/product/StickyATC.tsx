'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Loader2 } from 'lucide-react'

interface Props {
  /** Pass true once the inline ATC button has scrolled out of view */
  show:       boolean
  onAdd:      () => Promise<void>
  soldOut?:   boolean
  adding?:    boolean
  price:      string
  name:       string
}

export default function StickyATC({ show, onAdd, soldOut, adding, price, name }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div
      aria-hidden={!show}
      style={{
        position:   'fixed',
        bottom:     '60px',           /* sits above the mobile bottom-nav */
        left:       0,
        right:      0,
        zIndex:     49,
        display:    'flex',
        alignItems: 'center',
        height:     '60px',
        background: 'rgba(10,10,10,0.97)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop:  '1px solid rgba(255,255,255,0.07)',
        padding:    '0 16px',
        gap:        '16px',
        transform:  show ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 280ms cubic-bezier(0.32,0.72,0,1)',
        pointerEvents: show ? 'auto' : 'none',
      }}
      className="md:hidden"
    >
      {/* price + name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color:         '#fff',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap',
          marginBottom:  '1px',
        }}>
          {name}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize:   '13px',
          fontWeight: 700,
          color:      '#3DBA6F',
        }}>
          {price}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onAdd}
        disabled={adding || soldOut}
        aria-label={soldOut ? 'Sold out' : `Add ${name} to cart`}
        style={{
          height:        '44px',
          padding:       '0 24px',
          background:    soldOut ? 'transparent' : adding ? '#2EA05A' : '#3DBA6F',
          border:        soldOut ? '1px solid var(--border)' : 'none',
          color:         soldOut ? 'var(--text-muted)' : '#0A0A0A',
          fontFamily:    'var(--font-body)',
          fontSize:      '12px',
          fontWeight:    700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor:        soldOut || adding ? 'not-allowed' : 'pointer',
          opacity:       soldOut ? 0.5 : 1,
          display:       'flex',
          alignItems:    'center',
          gap:           '8px',
          flexShrink:    0,
          transition:    'background 150ms, opacity 150ms',
          borderRadius:  0,
        }}
      >
        {adding
          ? <Loader2 size={13} className="animate-spin" />
          : <ShoppingBag size={13} strokeWidth={2} />
        }
        {soldOut ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  )
}
