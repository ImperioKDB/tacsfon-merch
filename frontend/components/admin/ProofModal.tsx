'use client'

/**
 * ProofModal
 *
 * Phase 10 — Fullscreen lightbox for reviewing payment proof images.
 * - Mouse wheel zoom + drag to pan
 * - Zoom in/out/reset controls
 * - Download button
 * - Close on Escape or backdrop click
 * - Approve / Reject action buttons
 */

import { useEffect, useRef, useState, useCallback } from 'react'

const ADMIN_ACCENT = '#5B8CFF'

interface ProofModalProps {
  src:        string
  orderId:    string
  onClose:    () => void
  onApprove?: () => void
  onReject?:  () => void
  loading?:   boolean
}

export default function ProofModal({ src, orderId, onClose, onApprove, onReject, loading = false }: ProofModalProps) {
  const [scale,     setScale]     = useState(1)
  const [offset,    setOffset]    = useState({ x: 0, y: 0 })
  const [dragging,  setDragging]  = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const dragStart  = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.min(5, Math.max(0.5, s - e.deltaY * 0.001)))
  }, [])

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging || !dragStart.current) return
      setOffset({ x: dragStart.current.ox + (e.clientX - dragStart.current.x), y: dragStart.current.oy + (e.clientY - dragStart.current.y) })
    }
    function onUp() { setDragging(false); dragStart.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  function resetView() { setScale(1); setOffset({ x: 0, y: 0 }) }

  function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
    return (
      <button onClick={onClick} title={title} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
        color: 'var(--text-primary)', cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
      >
        {children}
      </button>
    )
  }

  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>PROOF</p>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: ADMIN_ACCENT }}>
            #{orderId.slice(-8).toUpperCase()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ToolBtn onClick={() => setScale(s => Math.min(5, s + 0.25))} title="Zoom in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </ToolBtn>
          <ToolBtn onClick={() => setScale(s => Math.max(0.5, s - 0.25))} title="Zoom out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </ToolBtn>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', minWidth: '38px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <ToolBtn onClick={resetView} title="Reset view">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
          </ToolBtn>
          <a href={src} download target="_blank" rel="noopener noreferrer" title="Download" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
            color: 'var(--text-primary)', textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
          <button onClick={onClose} title="Close (Esc)" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
            color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,82,82,0.1)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(224,82,82,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', position: 'relative',
      }}
        onWheel={handleWheel} onMouseDown={handleMouseDown}
      >
        {!imgLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '32px', height: '32px',
              border: `2px solid rgba(91,140,255,0.2)`, borderTop: `2px solid ${ADMIN_ACCENT}`,
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src} alt={`Payment proof for order ${orderId}`}
          onLoad={() => setImgLoaded(true)}
          style={{
            maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain',
            transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: dragging ? 'none' : 'transform 0.1s ease',
            userSelect: 'none', pointerEvents: 'none',
            opacity: imgLoaded ? 1 : 0,
          }}
          draggable={false}
        />
      </div>

      {/* Action bar */}
      {(onApprove || onReject) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        }}>
          {onReject && (
            <button onClick={onReject} disabled={loading} style={{
              padding: '10px 32px', background: 'rgba(224,82,82,0.1)',
              border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '4px',
              transition: 'all 0.15s', opacity: loading ? 0.5 : 1,
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(224,82,82,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(224,82,82,0.1)' }}
            >
              Reject
            </button>
          )}
          {onApprove && (
            <button onClick={onApprove} disabled={loading} style={{
              padding: '10px 32px',
              background: loading ? 'var(--bg-elevated)' : ADMIN_ACCENT,
              border: 'none', color: loading ? 'var(--text-muted)' : '#fff',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '4px',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#7AA3FF' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = ADMIN_ACCENT }}
            >
              {loading ? 'Processing…' : 'Approve Payment'}
            </button>
          )}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
