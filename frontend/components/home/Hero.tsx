'use client'
import Link from 'next/link'
import TShirtViewer3D from '@/components/3d/viewers/TShirtViewer3D'

export default function Hero() {
  return (
    <section id="hero" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '120px 24px 60px' // Massive padding to prevent Navbar overlap
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '60px', 
        alignItems: 'center', 
        width: '100%' 
      }}>
        
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-urbanist)', 
            fontWeight: 800, 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            lineHeight: 1, 
            color: 'var(--color-text-primary)', 
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Premium Merch.<br /><span style={{ color: 'var(--color-gold)' }}>Elevated Style.</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '480px', marginBottom: '40px', lineHeight: 1.6 }}>
            The official TACSFON collection. High-quality pieces designed to represent our community with excellence.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/products" style={{ background: 'var(--color-gold)', color: '#000', padding: '18px 36px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>SHOP NOW</Link>
            <Link href="/signup" style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', padding: '18px 36px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>JOIN US</Link>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }}>
          <TShirtViewer3D color="#7B1A2E" />
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'var(--color-text-disabled)', letterSpacing: '0.2em' }}>DRAG TO ROTATE</div>
        </div>
      </div>
    </section>
  )
}
