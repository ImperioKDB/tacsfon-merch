import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Users, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — TACSFON Merch',
  description: 'Learn about the TACSFON Merch Store — premium community merchandise for TACSFONITES.',
}

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <section style={{ maxWidth: '1024px', margin: '0 auto', padding: '72px 24px 56px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-body)', marginBottom: '16px' }}>
          About Us
        </p>
        <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.01em' }}>
          Wear the Community.<br />Wear the Identity.
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: '1.7', maxWidth: '600px' }}>
          TACSFON Merch is the official merchandise store of The Apostolic Church Student Fellowship Of Nigeria—
          a curated collection of premium clothing and accessories that let members
          carry their identity with pride wherever they go.
        </p>
      </section>

      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'var(--border)' }} />
      </div>

      <section style={{ maxWidth: '1024px', margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'start' }}>
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-body)', marginBottom: '14px' }}>
            Our Mission
          </p>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.2 }}>
            Quality products that represent something real
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: '1.7', marginBottom: '16px' }}>
            Every piece in the TACSFON collection is designed with intention — not just
            to look good, but to mean something. When you wear TACSFON Merch, you’re
            representing a community built on excellence, service, and the shared purpose of Christ.
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
            We source quality materials, design with care, and deliver an experience
            that lives up to the community we serve.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            { icon: ShoppingBag, title: 'Quality First',    body: 'Every product is reviewed before it reaches you. We stand behind what we sell.' },
            { icon: Users,       title: 'Community-Driven', body: 'The store exists to serve TACSFON members. Feedback shapes every collection.' },
            { icon: Star,        title: 'Authentic Design', body: 'Our pieces are exclusive to the TACSFON community — you won’t find them elsewhere.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(61,186,111,0.10)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: '1.6' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'var(--border)' }} />
      </div>

      <section style={{ maxWidth: '1024px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Ready to represent?
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px' }}>
          Browse the full collection and find your piece of the TACSFON identity.
        </p>
        <Link
          href="/products"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', background: 'var(--accent)', color: '#0A0A0F', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.06em', transition: 'all 150ms ease' }}
          className="hover:bg-gold-light hover:shadow-gold transition-all duration-fast"
        >
          Shop the Collection <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </section>
    </div>
  )
}
