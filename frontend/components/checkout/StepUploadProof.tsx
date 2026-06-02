'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter }                      from 'next/navigation'
import { UploadCloud, FileText, X }       from 'lucide-react'
import { createBrowserClient }            from '@/lib/supabase/browser'

interface Props {
  orderId:   string
  onSuccess?: () => void
}

const MAX_BYTES   = 5 * 1024 * 1024
const ACCEPTED    = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ACCEPTED_EXT = '.jpg,.jpeg,.png,.webp,.pdf'

function isMimeAccepted(mime: string) {
  return ACCEPTED.includes(mime)
}

export default function StepUploadProof({ orderId, onSuccess }: Props) {
  const router = useRouter()

  const [file,      setFile]      = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [apiError,  setApiError]  = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  function processFile(f: File) {
    setFileError(null)
    setApiError(null)
    if (!isMimeAccepted(f.type)) {
      setFileError('Only JPG, PNG, WebP, and PDF files are accepted.')
      return
    }
    if (f.size > MAX_BYTES) {
      setFileError('File is too large. Maximum size is 5MB.')
      return
    }
    setFile(f)
    if (f.type !== 'application/pdf') {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setFileError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true)  }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false) }, [])
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    setApiError(null)

    try {
      // FIX: Use absolute backend URL + auth token.
      // The previous relative fetch('/api/...') was hitting Vercel (no such route),
      // getting a 404 HTML response, failing to parse JSON, and showing "Connection issue."
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/proof`, {
        method:  'POST',
        headers: {
          'Content-Type': file.type,
          ...(session?.access_token
            ? { 'Authorization': `Bearer ${session.access_token}` }
            : {}),
        },
        body: file,
      })

      const body = await res.json()
      if (body?.success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/orders/${orderId}?proof=uploaded`)
        }
      } else {
        setApiError(body?.error?.message ?? 'Upload failed. Please try again.')
      }
    } catch {
      setApiError('Upload failed. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleSkip() {
    router.push(`/orders/${orderId}`)
  }

  const shortId = orderId.slice(0, 8).toUpperCase()

  return (
    <div
      className="p-6 space-y-5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Heading */}
      <div className="space-y-1">
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Urbanist, sans-serif' }}
        >
          Upload Payment Proof
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Order{' '}
          <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>#{shortId}</span>{' '}
          created. Upload your transfer screenshot so we can confirm your payment.
        </p>
      </div>

      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 py-12 px-6 cursor-pointer transition-all select-none"
          style={{
            border:     `2px dashed ${dragging ? 'var(--color-gold)' : 'var(--color-border)'}`,
            background: dragging ? 'var(--color-gold-muted)' : 'var(--color-surface-2)',
          }}
        >
          <UploadCloud
            size={36}
            style={{ color: dragging ? 'var(--color-gold)' : 'var(--color-text-disabled)' }}
          />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Drag &amp; drop your screenshot here
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              or{' '}
              <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                click to browse
              </span>
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
              JPG, PNG, WebP, or PDF — max 5MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXT}
            onChange={onInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div
          className="p-4 flex items-center gap-4"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Payment proof preview"
              className="w-16 h-16 object-cover flex-shrink-0"
              style={{ border: '1px solid var(--color-border)' }}
            />
          ) : (
            <div
              className="w-16 h-16 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <FileText size={24} style={{ color: 'var(--color-gold)' }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {file.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="p-1.5 flex-shrink-0 hover:opacity-80 transition-all"
            style={{ background: 'var(--color-surface)', color: 'var(--color-error)' }}
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {fileError && (
        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{fileError}</p>
      )}
      {apiError && (
        <p className="text-sm" style={{ color: 'var(--color-error)' }}>{apiError}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="w-full py-3.5 text-sm font-bold tracking-wide transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-gold)', color: '#000' }}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
            Uploading…
          </span>
        ) : (
          'Submit Proof'
        )}
      </button>

      <div className="text-center">
        <button
          onClick={handleSkip}
          disabled={uploading}
          className="text-xs hover:underline disabled:opacity-40 transition-all"
          style={{ color: 'var(--color-text-disabled)' }}
        >
          Skip for now — I'll upload from my order page
        </button>
      </div>
    </div>
  )
}
