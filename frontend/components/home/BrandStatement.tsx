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
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(61,186,111,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top accent line — replaces corner marks */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        }}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <span
          className="animate-fade-in stagger-1"
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
          className="animate-fade-in stagger-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          PREMIUM MERCH.
        </h2>

        <h2
          className="animate-fade-in stagger-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 72px)',
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
          className="animate-fade-in stagger-3"
          style={{
            width: '48px',
            height: '2px',
            background: 'var(--accent)',
            margin: '0 auto 32px',
          }}
        />

        <p
          className="animate-fade-in stagger-4"
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
          className="animate-fade-in stagger-5 hover:border-[#3DBA6F] hover:text-[#3DBA6F]"
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
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
        >
          Our Story <ArrowRight size={13} strokeWidth={2} />
        </Link>

      </div>
    </section>
  )
}
