import type { Metadata } from 'next'
import { MessageCircle, Clock, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact — TACSFON Merch',
  description: 'Get in touch with the TACSFON Merch team via WhatsApp or email.',
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* Header */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 24px 48px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', fontFamily: 'var(--font-inter)', marginBottom: '16px' }}>
          Get In Touch
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1, marginBottom: '16px' }}>
          We're here to help
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)', lineHeight: '1.7' }}>
          Have a question about an order, a product, or anything else?
          Reach out and we'll get back to you as quickly as we can.
        </p>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'var(--color-border)' }} />
      </div>

      {/* Contact cards */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '56px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* WhatsApp — primary, prominent */}
        {WA_NUMBER ? (
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              padding: '28px 24px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-gold)',
              textDecoration: 'none',
              transition: 'all var(--duration-fast) var(--ease-smooth)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-gold-muted)'
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-gold)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-surface)'
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
            }}
          >
            {/* Icon */}
            <div style={{ width: '52px', height: '52px', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={24} strokeWidth={1.5} style={{ color: '#0A0A0F' }} />
            </div>
            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Chat on WhatsApp
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                The fastest way to reach us. We typically respond within a few hours.
              </p>
            </div>
            {/* Arrow */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-gold)', flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        ) : (
          <div style={{ padding: '28px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle size={24} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>WhatsApp</p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Contact details coming soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Response time info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <Clock size={18} strokeWidth={1.5} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Response Times</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              WhatsApp messages are answered within a few hours during business hours.
              Order-related queries are prioritised.
            </p>
          </div>
        </div>

        {/* Order support note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <Mail size={18} strokeWidth={1.5} style={{ color: 'var(--color-text-disabled)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Order Enquiries</p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              For questions about an existing order, please include your order ID when you message us.
              You can find it in the{' '}
              <a href="/orders" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Orders</a> section of your account.
            </p>
          </div>
        </div>

      </section>

    </div>
  )
}