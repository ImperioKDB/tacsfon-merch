import Link from 'next/link'

export default function BrandStatement() {
  return (
    <section
      aria-labelledby="brand-heading"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner marks */}
      {(['top-left','top-right','bottom-left','bottom-right'] as const).map((pos) => {
        const [v, h] = pos.split('-') as ['top'|'bottom', 'left'|'right']
        return (
          <div
            key={pos}
            aria-hidden="true"
            style={{
              position: 'absolute',
              [v]: '24px',
              [h]: '24px',
              width: '20px',
              height: '20px',
              borderTop:    v === 'top'    ? `1px solid var(--color-gold)` : 'none',
              borderBottom: v === 'bottom' ? `1px solid var(--color-gold)` : 'none',
              borderLeft:   h === 'left'   ? `1px solid var(--color-gold)` : 'none',
              borderRight:  h === 'right'  ? `1px solid var(--color-gold)` : 'none',
            }}
          />
        )
      })}

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.625rem',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '24px',
          }}
        >
          Who We Are
        </span>

        <h2
          id="brand-heading"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 700,
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            lineHeight: 1,
            letterSpacing: '0.02em',
            color: 'var(--color-text-primary)',
            marginBottom: '32px',
          }}
        >
          Premium Merch.<br />
          <span style={{ color: 'var(--color-gold)' }}>Fellowship Spirit.</span>
        </h2>

        <div
          style={{
            width: '48px',
            height: '2px',
            background: 'var(--color-gold)',
            margin: '0 auto 28px',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.8,
            maxWidth: '560px',
            margin: '0 auto 40px',
          }}
        >
          TACSFON Merch exists to outfit the community with quality that
          reflects our values. Every piece is designed with intention —
          because what you wear says who you are.
        </p>

        <Link href="/about" className="cta-outline">
          Our Story
        </Link>
      </div>
    </section>
  )
}