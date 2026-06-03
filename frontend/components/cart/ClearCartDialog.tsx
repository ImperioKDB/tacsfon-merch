'use client'

/**
 * ClearCartDialog — Phase 6
 * Inline CSS only — no Tailwind utility classes.
 */

interface ClearCartDialogProps {
  onConfirm: () => void
  onCancel:  () => void
}

export default function ClearCartDialog({ onConfirm, onCancel }: ClearCartDialogProps) {
  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'cfFadeIn 180ms ease forwards' }}
    >
      <style>{`@keyframes cfFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '32px 28px', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>
            Clear Cart?
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            All items will be removed from your cart. This cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, minHeight: '48px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, minHeight: '48px', background: 'var(--danger)', border: 'none', color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
