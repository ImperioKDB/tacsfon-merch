'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', background: 'var(--color-bg)', paddingTop: '100px', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center', width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 800, fontSize: 'clamp(3.5rem, 12vw, 7rem)', lineHeight: 0.9, color: 'var(--color-text-primary)', marginBottom: '30px' }}>
          TACSFON<br /><span style={{ color: 'var(--color-gold)' }}>MERCH</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Premium quality merchandise for the community. Wear the identity, share the love.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/products" style={{ background: 'var(--color-gold)', color: '#000', padding: '16px 40px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '1px' }}>SHOP NOW</Link>
          <Link href="/signup" style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', padding: '16px 40px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '1px' }}>SIGN UP</Link>
        </div>
      </div>
    </section>
  )
}
