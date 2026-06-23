import type { Metadata } from 'next'
import { MessageCircle, Clock, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact — TACSFON Merch',
  description: 'Get in touch with the TACSFON Merch team via WhatsApp or email.',
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 24px 48px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-body)', marginBottom: '16px' }}>
          Get In Touch
        </p>
        <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '16px' }}>
          We’re here to help
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
          Have a question about an order, a product, or anything else?
          Reach out and we’ll get back to you as quickly as we can.
        </p>
      </section>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'var(--border)' }} />
      </div>

      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '56px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {WA_NUMBER ? (
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '28px 24px', background: 'var(--bg-surface)', border: '1px solid var(--accent)', textDecoration: 'none', transition: 'all 150ms ease' }}
            className="hover:bg-gold-muted hover:shadow-gold transition-all duration-fast"
          >
            <div style={{ width: '52px', height: '52px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={24} strokeWidth={1.5} style={{ color: '#0A0A0F' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.125rem', color: '#ffffff', marginBottom: '4px' }}>Chat on WhatsApp</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>The fastest way to reach us. We typically respond within a few hours.</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        ) : (
          <div style={{ padding: '28px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle size={24} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '4px' }}>WhatsApp</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Contact details coming soon.</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <Clock size={18} strokeWidth={1.5} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Response Times</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              WhatsApp messages are answered within a few hours during business hours. Order-related queries are prioritised.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <Mail size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Order Enquiries</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              For questions about an existing order, please include your order ID when you message us.
              You can find it in the{' '}
              <a href="/orders" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Orders</a> section of your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
