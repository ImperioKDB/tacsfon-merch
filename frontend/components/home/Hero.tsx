'use client'


import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Skeleton } from '@/components/ui'

// Three.js viewer — never rendered server-side
const HeroViewer = dynamic(() => import('./HeroViewer'), {
  ssr: false,
  loading: () => (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="skeleton" style={{ width: '80%', height: '80%' }} />
    </div>
  ),
})

// ── Gold particle dust (CSS-only, 12 particles) ───────────────────────────────
const PARTICLES = [
  { x: '15%', y: '70%', size: 3, dur: '6s', delay: '0s',  tx: '20px' },
  { x: '25%', y: '55%', size: 2, dur: '8s', delay: '1s',  tx: '-15px' },
  { x: '40%', y: '80%', size: 4, dur: '7s', delay: '2s',  tx: '10px' },
  { x: '55%', y: '60%', size: 2, dur: '9s', delay: '0.5s',tx: '-25px' },
  { x: '65%', y: '75%', size: 3, dur: '6s', delay: '3s',  tx: '18px' },
  { x: '75%', y: '50%', size: 2, dur: '8s', delay: '1.5s',tx: '-10px' },
  { x: '85%', y: '65%', size: 4, dur: '7s', delay: '0.8s',tx: '12px' },
  { x: '10%', y: '40%', size: 2, dur: '9s', delay: '2.5s',tx: '22px' },
  { x: '30%', y: '30%', size: 3, dur: '6s', delay: '4s',  tx: '-18px' },
  { x: '50%', y: '85%', size: 2, dur: '8s', delay: '1.2s',tx: '8px' },
  { x: '70%', y: '35%', size: 3, dur: '7s', delay: '3.5s',tx: '-20px' },
  { x: '90%', y: '80%', size: 2, dur: '9s', delay: '0.3s',tx: '15px' },
]

// Hero model URL — set NEXT_PUBLIC_HERO_MODEL_URL in .env.local
// Falls back to null (shows skeleton) if not configured
const HERO_MODEL_URL = process.env.NEXT_PUBLIC_HERO_MODEL_URL ?? null

export default function Hero() {
  return (
    <>
      {/* Particle + gradient CSS */}
      <style>{`
        @keyframes dust-float {
          0%   { transform: translateY(0) translateX(0) scale(1);   opacity: 0; }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.4; }
          100% { transform: translateY(-130px) translateX(var(--tx)) scale(0.4); opacity: 0; }
        }
        .hero-particle {
          position: absolute;
          background: var(--color-gold);
          animation: dust-float var(--dur) ease-in-out var(--delay) infinite;
          pointer-events: none;
        }
      `}</style>

      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0E0A1A 0%, var(--color-bg) 100%)',
        }}
      >
        {/* Particle dust */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              '--dur':   p.dur,
              '--delay': p.delay,
              '--tx':    p.tx,
            } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}

        {/* Content grid */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '80px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '64px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* ── Left: copy ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Eyebrow */}
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.625rem',
                fontWeight: 500,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '20px',
                display: 'block',
              }}
            >
              TACSFON Merch — Est. 2024
            </span>

            {/* Main heading */}
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 700,
                fontSize: 'clamp(3rem, 7vw, 6rem)',
                lineHeight: 0.9,
                letterSpacing: '0.01em',
                color: 'var(--color-text-primary)',
                marginBottom: '32px',
              }}
            >
              Wear the<br />
              <span style={{ color: 'var(--color-gold)' }}>Mission.</span>
            </h1>

            {/* Gold rule */}
            <div
              style={{
                width: '48px',
                height: '2px',
                background: 'var(--color-gold)',
                marginBottom: '24px',
              }}
            />

            {/* Subheading */}
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.75,
                maxWidth: '420px',
                marginBottom: '40px',
              }}
            >
              Premium quality merchandise for the TACSFON community.
              Every thread tells the story of who we are.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                href="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#0A0A0F',
                  background: 'var(--color-gold)',
                  border: '1px solid var(--color-gold)',
                  padding: '16px 36px',
                  textDecoration: 'none',
                  minWidth: '160px',
                  transition: 'background var(--duration-fast) var(--ease-smooth), box-shadow var(--duration-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-gold-light)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-gold)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-gold)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Shop Now
              </Link>

              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  background: 'transparent',
                  border: '1px solid var(--color-gold)',
                  padding: '16px 36px',
                  textDecoration: 'none',
                  minWidth: '160px',
                  transition: 'background var(--duration-fast) var(--ease-smooth)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gold-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* ── Right: 3D viewer ──────────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              maxHeight: '520px',
              margin: '0 auto',
            }}
            aria-label="3D product showcase — drag to rotate"
          >
            {/* "3D" badge */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 2,
                background: 'var(--color-gold-muted)',
                border: '1px solid rgba(200,134,10,0.4)',
                padding: '4px 10px',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.5625rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}
            >
              3D
            </div>

            {/* Drag hint */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                fontFamily: 'var(--font-inter)',
                fontSize: '0.5625rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--color-text-disabled)',
                pointerEvents: 'none',
              }}
            >
              Drag to rotate
            </div>

            {HERO_MODEL_URL ? (
              <HeroViewer modelUrl={HERO_MODEL_URL} />
            ) : (
              // Placeholder when no model URL is configured
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: 'var(--color-surface)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-disabled)',
                    textAlign: 'center',
                    padding: '0 24px',
                  }}
                >
                  Set NEXT_PUBLIC_HERO_MODEL_URL<br />in .env.local to load your 3D model
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.5625rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-text-disabled)',
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, var(--color-gold), transparent)',
            }}
          />
        </div>
      </section>
    </>
  )
}