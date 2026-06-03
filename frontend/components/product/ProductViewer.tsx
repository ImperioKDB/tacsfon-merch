'use client'

/**
 * ProductViewer — Phase 5
 *
 * Left panel of the product detail page.
 * - Main image display (aspect-ratio 3/4, portrait)
 * - Tabs: "IMAGE" | "3D VIEWER" (3D tab only shown if model_url present)
 * - Click main image → fullscreen lightbox with keyboard ESC to close
 * - Uses inline CSS custom properties exclusively — no Tailwind utility classes
 */

import Image       from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { X, ZoomIn, Box, ImageIcon }        from 'lucide-react'
import { resolveImageUrl }                  from '@/lib/utils/formatters'

interface ProductViewerProps {
  imageUrl:    string | null
  productName: string
  modelUrl?:   string | null
}

type ActiveTab = 'image' | '3d'

export default function ProductViewer({ imageUrl, productName, modelUrl }: ProductViewerProps) {
  const [activeTab,    setActiveTab]    = useState<ActiveTab>('image')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const fullImageUrl = resolveImageUrl(imageUrl)
  const has3D        = !!modelUrl

  const openLightbox  = () => { if (fullImageUrl) setLightboxOpen(true) }
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, closeLightbox])

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  return (
    <>
      <div style={{ position: 'sticky', top: '96px' }}>

        {has3D && (
          <div
            style={{
              display:      'flex',
              gap:          '2px',
              marginBottom: '12px',
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border)',
              padding:      '4px',
              width:        'fit-content',
            }}
          >
            {(['image', '3d'] as ActiveTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '6px',
                  padding:       '8px 16px',
                  border:        'none',
                  cursor:        'pointer',
                  fontSize:      '11px',
                  fontFamily:    'var(--font-body)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  fontWeight:    600,
                  transition:    'all 150ms ease',
                  background:    activeTab === tab ? 'var(--accent)' : 'transparent',
                  color:         activeTab === tab ? '#0A0A0A' : 'var(--text-muted)',
                }}
              >
                {tab === 'image'
                  ? <><ImageIcon size={12} /> Photo</>
                  : <><Box size={12} /> 3D View</>
                }
              </button>
            ))}
          </div>
        )}

        {(activeTab === 'image' || !has3D) && (
          <div
            onClick={openLightbox}
            className="pv-wrap"
            style={{
              position:    'relative',
              width:       '100%',
              aspectRatio: '3 / 4',
              overflow:    'hidden',
              background:  'var(--bg-surface)',
              border:      '1px solid var(--border)',
              cursor:      fullImageUrl ? 'zoom-in' : 'default',
            }}
          >
            {fullImageUrl ? (
              <>
                <Image
                  src={fullImageUrl}
                  alt={productName}
                  fill
                  priority
                  unoptimized
                  className="pv-img"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  style={{
                    position:       'absolute',
                    bottom:         '16px',
                    right:          '16px',
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '6px',
                    background:     'rgba(10,10,10,0.75)',
                    backdropFilter: 'blur(6px)',
                    border:         '1px solid var(--border)',
                    padding:        '6px 12px',
                    fontSize:       '10px',
                    fontFamily:     'var(--font-body)',
                    letterSpacing:  '0.1em',
                    textTransform:  'uppercase' as const,
                    color:          'var(--text-muted)',
                    pointerEvents:  'none',
                  }}
                >
                  <ZoomIn size={11} />
                  Click to zoom
                </div>
              </>
            ) : (
              <div
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  height:         '100%',
                  color:          'var(--text-muted)',
                  gap:            '12px',
                }}
              >
                <ImageIcon size={48} strokeWidth={1} />
                <span
                  style={{
                    fontSize:      '10px',
                    fontFamily:    'var(--font-body)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const,
                  }}
                >
                  Image Coming Soon
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === '3d' && has3D && (
          <div
            style={{
              width:          '100%',
              aspectRatio:    '3 / 4',
              background:     'var(--bg-surface)',
              border:         '1px solid var(--border)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          'var(--text-muted)',
              flexDirection:  'column',
              gap:            '12px',
            }}
          >
            <Box size={40} strokeWidth={0.8} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              3D Viewer
            </span>
          </div>
        )}

        <div
          style={{
            marginTop:  '16px',
            height:     '1px',
            background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)',
            width:      '60%',
          }}
        />
      </div>

      {lightboxOpen && fullImageUrl && (
        <div
          onClick={closeLightbox}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         1000,
            background:     'rgba(0,0,0,0.93)',
            backdropFilter: 'blur(8px)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'zoom-out',
          }}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close lightbox"
            style={{
              position:       'absolute',
              top:            '24px',
              right:          '24px',
              background:     'rgba(255,255,255,0.08)',
              border:         '1px solid var(--border)',
              color:          'var(--text-primary)',
              width:          '44px',
              height:         '44px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              zIndex:         1001,
            }}
          >
            <X size={18} />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              position:    'relative',
              width:       'min(90vw, 560px)',
              aspectRatio: '3 / 4',
              cursor:      'default',
            }}
          >
            <Image
              src={fullImageUrl}
              alt={productName}
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div
            style={{
              position:      'absolute',
              bottom:        '32px',
              left:          '50%',
              transform:     'translateX(-50%)',
              textAlign:     'center',
              color:         'var(--text-muted)',
              fontSize:      '11px',
              fontFamily:    'var(--font-body)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              whiteSpace:    'nowrap',
            }}
          >
            {productName}
          </div>
        </div>
      )}

      <style>{`
        .pv-img { transition: transform 600ms ease; }
        .pv-wrap:hover .pv-img { transform: scale(1.04); }
      `}</style>
    </>
  )
}
