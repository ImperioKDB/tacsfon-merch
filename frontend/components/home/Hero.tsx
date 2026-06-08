'use client'

/**
 * Hero
 *
 * Clean, premium hero with animated gradient orb background.
 * No corner brackets, no horizontal lines — those hurt the light theme.
 *
 * Background: animated floating green orb + subtle mesh pattern.
 * Works in both dark and light mode via CSS vars.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        position:       'relative',
        width:          '100%',
        minHeight:      '100dvh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        background:     'var(--bg-base)',
      }}
    >
      {/* ── Animated orb 1 — large, slow float ── */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          top:          '-10%',
          left:         '-15%',
          width:        '70vw',
          height:       '70vw',
          maxWidth:     '600px',
          maxHeight:    '600px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(61,186,111,0.18) 0%, transparent 70%)',
          animation:    'hero-float-1 12s ease-in-out infinite',
          pointerEvents:'none',
          filter:       'blur(40px)',
        }}
      />

      {/* ── Animated orb 2 — smaller, faster ── */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          bottom:       '-5%',
          right:        '-10%',
          width:        '50vw',
          height:       '50vw',
          maxWidth:     '420px',
          maxHeight:    '420px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(61,186,111,0.12) 0%, transparent 70%)',
          animation:    'hero-float-2 9s ease-in-out infinite',
          pointerEvents:'none',
          filter:       'blur(50px)',
        }}
      />

      {/* ── Subtle dot grid overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:      0,
          backgroundImage: `radial-gradient(circle, rgba(61,186,111,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          animation:  'hero-grid-fade 6s ease-in-out infinite alternate',
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position:   'relative',
          zIndex:     1,
          maxWidth:   '900px',
          margin:     '0 auto',
          padding:    '0 24px',
          textAlign:  'center',
        }}
      >
        {/* Eyebrow */}
        <p
          className="animate-fade-in"
          style={{
            fontFamily:     'var(--font-body)',
            fontSize:       '11px',
            fontWeight:     600,
            letterSpacing:  '0.28em',
            textTransform:  'uppercase',
            color:          'var(--accent)',
            marginBottom:   '28px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '12px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display:    'inline-block',
              width:      '32px',
              height:     '1px',
              background: 'var(--accent)',
            }}
          />
          TACSFON Community Merch
          <span
            aria-hidden="true"
            style={{
              display:    'inline-block',
              width:      '32px',
              height:     '1px',
              background: 'var(--accent)',
            }}
          />
        </p>

        {/* Headline */}
        <h1
          className="animate-fade-in stagger-1"
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(64px, 12vw, 128px)',
            lineHeight:    0.92,
            letterSpacing: '0.03em',
            color:         'var(--text-primary)',
            marginBottom:  0,
          }}
        >
          WEAR THE
        </h1>
        <h1
          className="animate-fade-in stagger-2"
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(64px, 12vw, 128px)',
            lineHeight:    0.92,
            letterSpacing: '0.03em',
            color:         'var(--accent)',
            marginBottom:  '32px',
          }}
        >
          MISSION
        </h1>

        {/* Sub */}
        <p
          className="animate-fade-in stagger-3"
          style={{
            fontFamily:  'var(--font-body)',
            fontSize:    'clamp(15px, 2vw, 18px)',
            color:       'var(--text-muted)',
            lineHeight:  1.7,
            maxWidth:    '520px',
            margin:      '0 auto 48px',
          }}
        >
          Premium community merchandise designed for the TACSFON family
          at UNIBEN. Quality that reflects who we are.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-in stagger-4"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '16px',
            flexWrap:       'wrap',
          }}
        >
          <Link
            href="/products"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '10px',
              fontFamily:     'var(--font-body)',
              fontSize:       '12px',
              fontWeight:     600,
              letterSpacing:  '0.12em',
              textTransform:  'uppercase',
              color:          '#fff',
              background:     'var(--accent)',
              padding:        '16px 36px',
              textDecoration: 'none',
              transition:     'background 200ms ease, transform 150ms ease',
              minHeight:      '52px',
              boxShadow:      '0 4px 24px rgba(61,186,111,0.35)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background  = 'var(--accent-hover)'
              el.style.transform   = 'translateY(-2px)'
              el.style.boxShadow   = '0 8px 32px rgba(61,186,111,0.45)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'var(--accent)'
              el.style.transform  = 'translateY(0)'
              el.style.boxShadow  = '0 4px 24px rgba(61,186,111,0.35)'
            }}
          >
            Explore Store
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/signup"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              fontFamily:     'var(--font-body)',
              fontSize:       '12px',
              fontWeight:     600,
              letterSpacing:  '0.12em',
              textTransform:  'uppercase',
              color:          'var(--text-primary)',
              background:     'transparent',
              border:         '1px solid var(--border)',
              padding:        '16px 36px',
              textDecoration: 'none',
              transition:     'border-color 200ms ease, color 200ms ease, transform 150ms ease',
              minHeight:      '52px',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'var(--accent)'
              el.style.color       = 'var(--accent)'
              el.style.transform   = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'var(--border)'
              el.style.color       = 'var(--text-primary)'
              el.style.transform   = 'translateY(0)'
            }}
          >
            Join Us
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-in stagger-5"
          aria-hidden="true"
          style={{
            marginTop:      '80px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            '8px',
          }}
        >
          <span style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:         'var(--text-muted)',
          }}>
            Scroll
          </span>
          <div style={{
            width:      '1px',
            height:     '40px',
            background: 'linear-gradient(to bottom, var(--accent), transparent)',
            animation:  'hero-scroll-pulse 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes hero-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(4%, 6%) scale(1.05); }
          66%       { transform: translate(-3%, 3%) scale(0.97); }
        }
        @keyframes hero-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-5%, -4%) scale(1.08); }
          70%       { transform: translate(3%, -6%) scale(0.95); }
        }
        @keyframes hero-grid-fade {
          from { opacity: 0.4; }
          to   { opacity: 1; }
        }
        @keyframes hero-scroll-pulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.4; transform: scaleY(0.7); }
        }
      `}</style>
    </section>
  )
}
