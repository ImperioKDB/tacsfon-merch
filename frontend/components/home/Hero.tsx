'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const { user } = useAuth()

  return (
    <section
      aria-label="Hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--bg-base)',
      }}
    >
      {/* ── Background texture + radial glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* ── Horizontal rule top ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border) 30%, var(--border) 70%, transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Corner marks ── */}
      {([
        { top: '32px',   left: '32px',  borderTop: '1px solid', borderLeft: '1px solid', borderBottom: 'none', borderRight: 'none' },
        { top: '32px',   right: '32px', borderTop: '1px solid', borderRight: '1px solid', borderBottom: 'none', borderLeft: 'none' },
        { bottom: '32px', left: '32px', borderBottom: '1px solid', borderLeft: '1px solid', borderTop: 'none', borderRight: 'none' },
        { bottom: '32px', right: '32px', borderBottom: '1px solid', borderRight: '1px solid', borderTop: 'none', borderLeft: 'none' },
      ] as const).map((style, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            borderColor: 'rgba(201,168,76,0.35)',
            borderStyle: 'solid',
            ...style,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <p
          className="animate-fade-in"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span
            aria-hidden="true"
            style={{ display: 'inline-block', width: '32px', height: '1px', background: 'var(--accent)' }}
          />
          TACSFON Community Merch
          <span
            aria-hidden="true"
            style={{ display: 'inline-block', width: '32px', height: '1px', background: 'var(--accent)' }}
          />
        </p>

        {/* Main headline */}
        <h1
          className="animate-fade-in stagger-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(64px, 12vw, 128px)',
            lineHeight: 0.92,
            letterSpacing: '0.03em',
            color: 'var(--text-primary)',
            marginBottom: '0',
          }}
        >
          WEAR THE
        </h1>
        <h1
          className="animate-fade-in stagger-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(64px, 12vw, 128px)',
            lineHeight: 0.92,
            letterSpacing: '0.03em',
            color: 'var(--accent)',
            marginBottom: '32px',
          }}
        >
          MISSION
        </h1>

        {/* Subtext */}
        <p
          className="animate-fade-in stagger-3"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto 48px',
          }}
        >
          Premium community merchandise designed for the TACSFON family at UNIBEN.
          Quality that reflects who we are.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-in stagger-4"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#000',
              background: 'var(--accent)',
              padding: '16px 36px',
              textDecoration: 'none',
              transition: 'background 150ms ease, transform 150ms ease',
              minHeight: '52px',
            }}
            className="hover:bg-[var(--accent-hover)] hover:-translate-y-px"
          >
            Explore Store
            <ArrowRight size={14} strokeWidth={2} />
          </Link>

          {!user && (
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: '16px 36px',
                textDecoration: 'none',
                transition: 'border-color 150ms ease, color 150ms ease',
                minHeight: '52px',
              }}
              className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Join Us
            </Link>
          )}
        </div>

        {/* Scroll hint */}
        <div
          className="animate-fade-in stagger-5"
          aria-hidden="true"
          style={{
            marginTop: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, var(--accent), transparent)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
