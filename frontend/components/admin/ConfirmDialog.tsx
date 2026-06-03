'use client'

/**
 * ConfirmDialog
 *
 * Phase 10 — Generic confirmation modal for destructive admin actions.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     title="Delete product?"
 *     description="This cannot be undone."
 *     confirmLabel="Delete"
 *     variant="danger"
 *     loading={deleting}
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import { useEffect, useRef } from 'react'

const ADMIN_ACCENT = '#5B8CFF'

interface ConfirmDialogProps {
  open:          boolean
  title:         string
  description?:  string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:      'danger' | 'primary'
  loading?:      boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export default function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && !loading) onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) dialogRef.current?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus()
  }, [open])

  if (!open) return null

  const confirmBg    = variant === 'danger' ? 'var(--danger)' : ADMIN_ACCENT
  const confirmHover = variant === 'danger' ? '#c43d3d'       : '#7AA3FF'

  return (
    <div
      onClick={e => { if (!loading && e.target === e.currentTarget) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <div ref={dialogRef} role="alertdialog" aria-modal="true"
        aria-labelledby="confirm-title" aria-describedby={description ? 'confirm-desc' : undefined}
        style={{
          background: '#141414', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '400px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', marginBottom: '16px',
          background: variant === 'danger' ? 'rgba(224,82,82,0.12)' : `${ADMIN_ACCENT}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {variant === 'danger' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ADMIN_ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h2 id="confirm-title" style={{
          margin: '0 0 8px', fontFamily: 'var(--font-display)',
          fontSize: '20px', letterSpacing: '0.05em', color: 'var(--text-primary)',
        }}>
          {title}
        </h2>
        {description && (
          <p id="confirm-desc" style={{
            margin: '0 0 24px', fontFamily: 'var(--font-body)',
            fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6,
          }}>
            {description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: description ? 0 : '24px' }}>
          <button data-cancel onClick={onCancel} disabled={loading} style={{
            padding: '9px 20px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
            letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '4px', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '9px 20px',
            background: loading ? 'var(--bg-elevated)' : confirmBg,
            border: 'none', color: loading ? 'var(--text-muted)' : '#fff',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '4px', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = confirmHover }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = confirmBg }}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
