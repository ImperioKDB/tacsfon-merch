'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section id="hero" style={{ 
      position: 'relative', 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'var(--color-bg)',
      paddingTop: '100px'
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 24px',
        textAlign: 'center',
        width: '100%'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-urbanist)', 
          fontWeight: 800, 
          fontSize: 'clamp(3rem, 10vw, 6rem)', 
          lineHeight: 1, 
          color: 'var(--color-text-primary)', 
          marginBottom: '24px' 
        }}>
          TACSFON<br /><span style={{ color: 'var(--color-gold)' }}>MERCH STORE</span>
        </h1>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: '1.2rem', 
          maxWidth: '600px', 
          margin: '0 auto 48px',
          lineHeight: 1.6 
        }}>
          Premium quality merchandise designed for the community. 
          Wear your identity with excellence.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/products" style={{ 
            background: 'var(--color-gold)', 
            color: '#000', 
            padding: '18px 48px', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            fontSize: '1rem'
          }}>SHOP COLLECTION</Link>
        </div>
      </div>
    </section>
  )
}
