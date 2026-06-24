import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BrandStatement() {
  return (
    <section
      aria-labelledby="brand-heading"
      style={{
        background: 'var(--bg-surface)',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        padding: '100px 24px',
        margin: '16px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient drifting orb — GPU only, infinite */}
      <div
        aria-hidden="true"
        className="brand-orb"
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,186,111,0.09) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />

      {/* Top accent line — scale reveal from center */}
      <div
        aria-hidden="true"
        className="brand-top-line"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '80px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          transformOrigin: 'center',
        }}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <span
          className="brand-label"
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '28px',
          }}
        >
          Who We Are
        </span>

        <h2
          id="brand-heading"
          className="brand-h1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          PREMIUM MERCH.
        </h2>

        <h2
          className="brand-h2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: 'var(--accent)',
            marginBottom: '36px',
          }}
        >
          FELLOWSHIP SPIRIT.
        </h2>

        <div
          aria-hidden="true"
          className="brand-rule"
          style={{
            height: '2px',
            background: 'var(--accent)',
            margin: '0 auto 32px',
            width: '48px',
            transformOrigin: 'center',
          }}
        />

        <p
          className="brand-body"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 1.5vw, 17px)',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            maxWidth: '520px',
            margin: '0 auto 40px',
          }}
        >
          TACSFON Merch exists to outfit the community with quality that reflects
          our values. Every piece is designed with intention — because what you
          wear says who you are.
        </p>

        <Link
          href="/about"
          className="brand-cta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            padding: '14px 28px',
            textDecoration: 'none',
            position: 'relative',
            overflow: 'hidden',
            isolation: 'isolate',
          }}
        >
          Our Story <ArrowRight size={13} strokeWidth={2} />
        </Link>

      </div>
    </section>
  )
}
