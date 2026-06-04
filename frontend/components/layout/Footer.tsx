// Footer — Server Component (no 'use client' needed)
import Link from 'next/link'

const NAV_LINKS = {
  Shop: [
    { label: 'All Products',  href: '/products' },
    { label: 'New Arrivals',  href: '/products?sort=newest' },
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

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        marginTop: '96px',
      }}
    >
      {/* Gold top rule */}
      <div
        aria-hidden="true"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, #3DBA6F, transparent 60%)',
        }}
      />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px 40px',
        }}
      >
        {/* ── Top grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '48px',
            paddingBottom: '48px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Brand column */}
          <div>
            {/* Logo lockup */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '16px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '5px',
                  height: '5px',
                  background: '#3DBA6F',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  letterSpacing: '0.12em',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                TACSFON
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.2em',
                  color: '#3DBA6F',
                  textTransform: 'uppercase',
                }}
              >
                MERCH
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                marginBottom: '24px',
                maxWidth: '200px',
              }}
            >
              Premium merch for the TACSFON community at UNIBEN.
            </p>

            {WA_NUMBER && (
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#3DBA6F',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 150ms ease',
                }}
              >
                {/* WhatsApp icon inline SVG */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(NAV_LINKS).map(([group, links]) => (
            <div key={group}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '20px',
                }}
              >
                {group}
              </p>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '12px',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  className="hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            &copy; {year} TACSFON Merch. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            UNIBEN · Nigeria
          </p>
        </div>
      </div>
    </footer>
  )
}
