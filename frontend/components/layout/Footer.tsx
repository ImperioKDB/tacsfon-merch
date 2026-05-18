// Server Component — no 'use client' needed.
// Hover effects use CSS classes from globals.css (.link, .link-gold).
import Link from 'next/link'

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
  ],
  Company: [
    { label: 'About',   href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Account: [
    { label: 'My Orders', href: '/orders' },
    { label: 'Profile',   href: '/profile' },
    { label: 'Cart',      href: '/cart' },
  ],
}

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '0.625rem',
  fontWeight: 500,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--color-text-disabled)',
  display: 'block',
  marginBottom: '16px',
}

const LINK_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-inter)',
  fontSize: '0.875rem',
  display: 'block',
  marginBottom: '12px',
}

export default function Footer() {
  const year = new Date().getFullYear()
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  return (
    <footer
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px 40px',
        }}
      >
        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '48px',
            paddingBottom: '48px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-primary)',
                }}
              >
                TACSFON Merch
              </span>
              <span
                aria-hidden="true"
                style={{ width: '5px', height: '5px', background: 'var(--color-gold)', display: 'inline-block', flexShrink: 0 }}
              />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '20px',
                maxWidth: '200px',
              }}
            >
              Premium merch for the TACSFON community.
            </p>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-gold"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                WhatsApp Us
              </a>
            )}
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <span style={SECTION_LABEL}>{group}</span>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="link" style={LINK_STYLE}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <p
          style={{
            paddingTop: '28px',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.75rem',
            color: 'var(--color-text-disabled)',
            letterSpacing: '0.04em',
          }}
        >
          &copy; {year} TACSFON Merch. All rights reserved.
        </p>
      </div>
    </footer>
  )
}