'use client'
import Link from 'next/link'
import TShirtViewer3D from '@/components/3d/viewers/TShirtViewer3D'

const HERO_MODEL_URL = process.env.NEXT_PUBLIC_HERO_MODEL_URL ?? null

export default function Hero() {
  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', width: '100%' }}>
        
        <div>
          <h1 style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 800, fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: 1, color: 'var(--color-text-primary)', marginBottom: '24px' }}>
            Premium Merch.<br /><span style={{ color: 'var(--color-gold)' }}>Elevated Style.</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '450px', marginBottom: '40px' }}>
            The official TACSFON collection. Quality pieces designed for the community.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ background: 'var(--color-gold)', color: '#000', padding: '16px 32px', fontWeight: 'bold', textDecoration: 'none' }}>Shop Now</Link>
            <Link href="/signup" style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', padding: '16px 32px', fontWeight: 'bold', textDecoration: 'none' }}>Create Account</Link>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', maxHeight: '500px' }}>
          <TShirtViewer3D color="#7B1A2E" />
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-gold-muted)', padding: '4px 8px', fontSize: '10px', color: 'var(--color-gold)' }}>INTERACTIVE 3D</div>
        </div>
      </div>
    </section>
  )
}
