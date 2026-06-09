'use client'

/**
 * StepUploadProof — Phase 7 fixed
 *
 * Uploads payment screenshot to backend.
 * Uses Supabase session token for Authorization.
 * On success → redirects to /orders.
 */

import { useState, useCallback, useRef } from 'react'
import { UploadCloud, X, CheckCircle2, Loader2 } from 'lucide-react'
import { toast }                    from 'sonner'
import { createBrowserClient }      from '@/lib/supabase/browser'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB        = 5

interface Props {
  orderId: string
  onDone:  () => void
  onBack:  () => void
}

export default function StepUploadProof({ orderId, onDone, onBack }: Props) {
  const [file,      setFile]      = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded,  setUploaded]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = useCallback((f: File) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Only JPG, PNG, or WebP files are accepted.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB} MB.`)
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pick(dropped)
  }, [pick])

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)

    try {
      // 1. Get the current session token
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('You must be signed in to submit an order. Please sign in and try again.')
      }

      // 2. Upload the proof image
      const API  = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
      const form = new FormData()
      form.append('proof', file)

      const res = await fetch(`${API}/api/orders/${orderId}/proof`, {
        method:  'POST',
        body:    form,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          // Do NOT set Content-Type here — browser sets multipart boundary automatically
        },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          body?.error?.message ??
          body?.message ??
          `Upload failed (${res.status})`
        )
      }

      setUploaded(true)
      toast.success('Order submitted! We will verify your payment shortly.')
    } catch (e: any) {
      console.error('[StepUploadProof] submit error:', e)
      toast.error(e.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  /* ── Success state ── */
  if (uploaded) {
    return (
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '24px',
        padding:       '48px 0',
        textAlign:     'center',
      }}>
        <CheckCircle2 size={56} style={{ color: 'var(--success)' }} strokeWidth={1.5} />
        <div>
          <h2 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '32px',
            letterSpacing: '0.04em',
            color:         'var(--text-primary)',
            margin:        '0 0 8px',
            textTransform: 'uppercase',
          }}>
            Order Placed!
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '14px',
            color:      'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth:   '320px',
            margin:     '0 auto',
          }}>
            Your payment proof has been submitted. The TACSFON team will
            verify it shortly and you'll be notified.
          </p>
        </div>
        <button
          onClick={onDone}
          style={{
            minHeight:     '52px',
            padding:       '0 40px',
            background:    'var(--accent)',
            border:        'none',
            color:         '#0A0A0A',
            fontFamily:    'var(--font-body)',
            fontSize:      '13px',
            fontWeight:    700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor:        'pointer',
          }}
        >
          View My Orders
        </button>
      </div>
    )
  }

  /* ── Upload form ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Instruction */}
      <div style={{
        padding:    '14px 16px',
        background: 'var(--accent-dim)',
        border:     '1px solid var(--accent)',
      }}>
        <p style={{
          fontFamily:  'var(--font-body)',
          fontSize:    '13px',
          color:       'var(--text-primary)',
          margin:      0,
          lineHeight:  1.5,
        }}>
          Take a screenshot of your bank transfer confirmation and upload it below.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          border:         `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          background:     dragging ? 'var(--accent-dim)' : 'var(--bg-surface)',
          padding:        '40px 24px',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
          cursor:         file ? 'default' : 'pointer',
          transition:     'border-color 150ms, background 150ms',
          textAlign:      'center',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) pick(f) }}
        />

        {preview ? (
          <>
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Payment proof preview"
                style={{ width: '100%', maxHeight: '260px', objectFit: 'contain', display: 'block' }}
              />
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                style={{
                  position:       'absolute',
                  top:            '-10px',
                  right:          '-10px',
                  width:          '28px',
                  height:         '28px',
                  borderRadius:   '50%',
                  background:     'var(--bg-elevated)',
                  border:         '1px solid var(--border)',
                  color:          'var(--text-primary)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         'pointer',
                }}
              >
                <X size={12} />
              </button>
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize:   '12px',
              color:      'var(--text-muted)',
              margin:     0,
            }}>
              {file?.name}
            </p>
          </>
        ) : (
          <>
            <UploadCloud
              size={40}
              strokeWidth={1.2}
              style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 150ms' }}
            />
            <div>
              <p style={{
                fontFamily:  'var(--font-body)',
                fontSize:    '14px',
                fontWeight:  600,
                color:       'var(--text-primary)',
                margin:      '0 0 4px',
              }}>
                Tap to upload or drag here
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize:   '12px',
                color:      'var(--text-muted)',
                margin:     0,
              }}>
                JPG, PNG or WebP · Max {MAX_MB} MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          disabled={uploading}
          style={{
            flex:          '0 0 auto',
            minHeight:     '52px',
            padding:       '0 24px',
            background:    'var(--bg-surface)',
            border:        '1px solid var(--border)',
            color:         'var(--text-muted)',
            fontFamily:    'var(--font-body)',
            fontSize:      '12px',
            fontWeight:    700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        uploading ? 'not-allowed' : 'pointer',
            opacity:       uploading ? 0.5 : 1,
          }}
        >
          ← Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          style={{
            flex:           1,
            minHeight:      '52px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '8px',
            background:     !file
              ? 'var(--bg-elevated)'
              : uploading
                ? 'var(--accent-hover)'
                : 'var(--accent)',
            border:         'none',
            color:          !file ? 'var(--text-muted)' : '#0A0A0A',
            fontFamily:     'var(--font-body)',
            fontSize:       '13px',
            fontWeight:     700,
            letterSpacing:  '0.15em',
            textTransform:  'uppercase',
            cursor:         !file || uploading ? 'not-allowed' : 'pointer',
            transition:     'background 200ms',
          }}
        >
          {uploading
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
            : 'Submit Order'
          }
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
