'use client'
interface Props { title: string; message: string; confirmLabel: string; variant?: 'default' | 'danger'; onConfirm: () => void; onCancel: () => void }
export default function ConfirmDialog({ title, message, confirmLabel, variant = 'default', onConfirm, onCancel }: Props) {
  const bg = variant === 'danger' ? 'var(--color-error)' : 'var(--color-gold)'
  const fg = variant === 'danger' ? '#fff' : '#0A0A0F'
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} onClick={onCancel} />
      <div style={{ position: 'relative', width: '380px', maxWidth: '95vw', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '28px', zIndex: 1 }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, fontFamily: 'var(--font-urbanist)', color: 'var(--color-text-primary)', marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)', lineHeight: '1.5', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'var(--font-inter)' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '9px 18px', background: bg, border: 'none', color: fg, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}