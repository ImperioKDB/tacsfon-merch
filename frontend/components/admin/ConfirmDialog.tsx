'use client'
import React from 'react'

export interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'danger'
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, variant = 'default' }: ConfirmDialogProps) {
  const isDanger = variant === 'danger'
  
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
        padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        <p style={{
          fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.4em', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic',
        }}>
          System_Confirmation_Required
        </p>
        
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '24px', color: '#ffffff', textTransform: 'uppercase',
          lineHeight: 1, marginBottom: '12px', fontStyle: 'italic',
        }}>
          {title}
        </h3>
        
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)',
          lineHeight: 1.6, marginBottom: '32px',
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', transition: 'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            style={{
              flex: 1, padding: '12px 0', background: isDanger ? 'var(--danger)' : 'var(--accent)', border: 'none',
              color: isDanger ? '#ffffff' : '#0A0A0A', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', transition: 'background 150ms',
            }}
            onMouseEnter={e => {
              if (isDanger) e.currentTarget.style.background = '#c93030'
              else e.currentTarget.style.background = '#ffffff'
            }}
            onMouseLeave={e => {
              if (isDanger) e.currentTarget.style.background = 'var(--danger)'
              else e.currentTarget.style.background = 'var(--accent)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
