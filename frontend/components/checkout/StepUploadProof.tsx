'use client'

/**
 * StepUploadProof — Phase 7
 *
 * Checkout step 3: student uploads payment screenshot / receipt.
 * - Drag-and-drop zone: dashed border turns gold on drag-over
 * - File thumbnail preview after selection
 * - Client-side size/type validation before submit
 * - Inline CSS only — no Tailwind utility classes
 */

import { useState, useCallback, useRef } from 'react'
import { UploadCloud, FileImage, X, CheckCircle2 } from 'lucide-react'
import { apiFetch } from '@/lib/api/fetch'
import { toast }    from 'sonner'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB        = 5

interface Props {
  orderId: string
  onDone:  () => void
  onBack:  () => void
}

export default function StepUploadProof({ orderId, onDone, onBack }: Props) {
  const [file,       setFile]       = useState<File | null>(null)
  const [preview,    setPreview]    = useState<string | null>(null)
  const [dragging,   setDragging]   = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [uploaded,   setUploaded]   = useState(false)
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
      const form = new FormData()
      form.append('proof', file)
      await apiFetch(`/orders/${orderId}/proof`, { method: 'POST', body: form, isFormData: true })
      setUploaded(true)
      toast.success('Payment proof uploaded successfully!')
    } catch (e: any) {
      toast.error(e.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (uploaded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '48px 0', textAlign: 'center' }}>
        <CheckCircle2 size={56} style={{ color: 'var(--success)' }} strokeWidth={1.5} />
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', color: 'var(--text-primary)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Order Placed!
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto' }}>
            Your order has been submitted. The TACSFON team will confirm your payment shortly and you'll receive a notification.
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          border:         `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--border)' : 'var(--border)'}`,
          background:     dragging ? 'rgba(201,168,76,0.06)' : 'var(--bg-surface)',
          padding:        '40px 24px',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
          cursor:         file ? 'default' : 'pointer',
          transition:     'border-color 150ms, background 150ms',
          position:       'relative',
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
            {/* Preview */}
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
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {file?.name}
            </p>
          </>
        ) : (
          <>
            <div style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 150ms' }}>
              {dragging ? <UploadCloud size={40} strokeWidth={1.2} /> : <FileImage size={40} strokeWidth={1.2} />}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: dragging ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 600, margin: '0 0 4px 0', transition: 'color 150ms' }}>
                {dragging ? 'Drop it here' : 'Upload your payment screenshot'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Drag & drop or click to browse · JPG, PNG, WebP · Max {MAX_MB} MB
              </p>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          disabled={uploading}
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
            cursor:         uploading ? 'not-allowed' : 'pointer',
            opacity:        uploading ? 0.5 : 1,
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
            gap:            '10px',
            background:     file && !uploading ? 'var(--accent)' : 'var(--bg-elevated)',
            border:         'none',
            color:          file && !uploading ? '#0A0A0A' : 'var(--text-muted)',
            fontFamily:     'var(--font-body)',
            fontSize:       '13px',
            fontWeight:     700,
            letterSpacing:  '0.15em',
            textTransform:  'uppercase',
            cursor:         file && !uploading ? 'pointer' : 'not-allowed',
            transition:     'background 200ms, color 200ms',
          }}
        >
          <UploadCloud size={16} />
          {uploading ? 'Uploading…' : 'Submit Order'}
        </button>
      </div>
    </div>
  )
}
