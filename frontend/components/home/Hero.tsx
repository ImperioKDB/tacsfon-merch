'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import TShirtViewer3D from '@/components/3d/viewers/TShirtViewer3D'

const HERO_MODEL_URL = process.env.NEXT_PUBLIC_HERO_MODEL_URL ?? null

export default function Hero() {
  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0E0A1A 0%, var(--color-bg) 100%)' }}>
      <div style={{ position: 'relative', z_index: 1, maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center', width: '100%' }}>
        
        {/* Left Content */}
        <div>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '20px', display: 'block' }}>TACSFON Merch — Est. 2024</span>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 0.9, letterSpacing: '0.01em', color: 'var(--color-text-primary)', marginBottom: '32px' }}>Wear the<br /><span style={{ color: 'var(--color-gold)' }}>Mission.</span></h1>
          <div style={{ width: '48px', height: '2px', background: 'var(--color-gold)', marginBottom: '24px' }} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', color: 'var(--color-text-secondary)', lineHeight: 1.75, maxWidth: '420px', marginBottom: '40px' }}>Premium quality merchandise for the TACSFON community. Every thread tells the story of who we are.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/products" className="cta-button" style={{ background: 'var(--color-gold)', color: '#0A0A0F', padding: '16px 36px', textDecoration: 'none', fontWeight: 'bold' }}>Shop Now</Link>
          </div>
        </div>

        {/* Right Content: The 3D Merch */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxHeight: '520px' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2, background: 'var(--color-gold-muted)', border: '1px solid rgba(200,134,10,0.4)', padding: '4px 10px', fontSize: '0.6rem', color: 'var(--color-gold)' }}>3D</div>
          
          {/* Logic: If URL is 'procedural', show the code-built T-Shirt. Otherwise, show nothing. */}
          {HERO_MODEL_URL === 'procedural' ? (
            <TShirtViewer3D color="#7B1A2E" />
          ) : (
            <div style={{ width: '100%', height: '100%', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', textAlign: 'center', padding: '20px' }}>
              <span style={{ color: 'var(--color-text-disabled)', fontSize: '0.8rem' }}>PROD MODE: Set NEXT_PUBLIC_HERO_MODEL_URL to 'procedural' in Vercel</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
