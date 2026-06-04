import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BrandStatement() {
  return (
    <section
      aria-labelledby="brand-heading"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Corner marks */}
      {([
        { top: '24px',    left: '24px',  borderTop: '1px solid', borderLeft: '1px solid',  borderBottom: 'none', borderRight: 'none' },
        { top: '24px',    right: '24px', borderTop: '1px solid', borderRight: '1px solid', borderBottom: 'none', borderLeft: 'none'  },
        { bottom: '24px', left: '24px',  borderBottom: '1px solid', borderLeft: '1px solid',  borderTop: 'none', borderRight: 'none' },
        { bottom: '24px', right: '24px', borderBottom: '1px solid', borderRight: '1px solid', borderTop: 'none', borderLeft: 'none'  },
      ] as const).map((style, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            borderColor: 'rgba(201,168,76,0.3)',
            borderStyle: 'solid',
            ...style,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#3DBA6F',
            marginBottom: '28px',
          }}
        >
          Who We Are
        </span>

        <h2
          id="brand-heading"
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
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 72px)',
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: '#3DBA6F',
            marginBottom: '36px',
          }}
        >
          FELLOWSHIP SPIRIT.
        </h2>

        {/* Gold rule */}
        <div
          aria-hidden="true"
          style={{
            width: '48px',
            height: '2px',
            background: '#3DBA6F',
            margin: '0 auto 32px',
          }}
        />

        <p
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
          className="hover:border-[#3DBA6F] hover:text-[#3DBA6F]"
        >
          Our Story <ArrowRight size={13} strokeWidth={2} />
        </Link>
      </div>
    </section>
  )
}
