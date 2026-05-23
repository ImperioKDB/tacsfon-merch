'use client'
import Link from 'next/link'
import TShirtViewer3D from '@/components/3d/viewers/TShirtViewer3D'

export default function Hero() {
  return (
    <section id="hero" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'var(--color-bg)',
      paddingTop: '100px'
    }}>
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '20px 24px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '40px', 
        alignItems: 'center', 
        width: '100%' 
      }}>
        
        <div style={{ zIndex: 10 }}>
          <h1 style={{ 
            fontFamily: 'var(--font-urbanist)', 
            fontWeight: 800, 
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', 
            lineHeight: 1.1, 
            color: 'var(--color-text-primary)', 
            marginBottom: '20px' 
          }}>
            Premium Merch.<br /><span style={{ color: 'var(--color-gold)' }}>Elevated Style.</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '450px', marginBottom: '32px', lineHeight: 1.6 }}>
            The official TACSFON collection. High-quality pieces designed to represent our community with excellence.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ background: 'var(--color-gold)', color: '#000', padding: '14px 32px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.05em' }}>SHOP NOW</Link>
            <Link href="/signup" style={{ border: '1.5px solid var(--color-gold)', color: 'var(--color-gold)', padding: '14px 32px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.05em' }}>JOIN US</Link>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', maxHeight: '480px', display: 'flex', justifyContent: 'center' }}>
          <TShirtViewer3D color="#7B1A2E" />
          <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--color-gold-muted)', border: '1px solid var(--border-gold)', padding: '4px 10px', fontSize: '10px', color: 'var(--color-gold)', fontWeight: 'bold' }}>3D INTERACTIVE</div>
        </div>
      </div>
    </section>
  )
}
