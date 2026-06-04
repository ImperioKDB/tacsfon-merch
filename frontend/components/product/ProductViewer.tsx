'use client'

import Image from 'next/image'

interface Props {
  imageUrl:    string | null
  productName: string
}

export default function ProductViewer({ imageUrl, productName }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main image */}
      <div style={{
        position:   'relative',
        aspectRatio: '3 / 4',
        background: 'var(--bg-elevated)',
        border:     '1px solid var(--border)',
        overflow:   'hidden',
      }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            style={{ objectFit: 'cover', transition: 'transform 600ms ease' }}
            unoptimized
            onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)')}
            onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{
            width:           '100%',
            height:          '100%',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontFamily:      'var(--font-mono)',
            fontSize:        '10px',
            letterSpacing:   '0.2em',
            textTransform:   'uppercase',
            color:           'var(--border)',
          }}>
            No Image
          </div>
        )}
      </div>

      {/* Accent rule */}
      <div style={{
        height:     '1px',
        width:      '48px',
        background: 'linear-gradient(to right, var(--accent), transparent)',
      }} />
    </div>
  )
}
