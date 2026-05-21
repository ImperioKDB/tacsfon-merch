import type { Metadata }                          from 'next'
import { Cormorant_Garamond, Inter, Urbanist }    from 'next/font/google'
import { Toaster }                                from 'sonner'
import '@/styles/globals.css'

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['400', '600', '700'],
  variable: '--font-cormorant',
  display:  'swap',
})

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-inter',
  display:  'swap',
})

// Resolves --font-urbanist used by admin pages, cart, checkout, orders, profile
const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-urbanist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'TACSFON Merch',
    template: '%s | TACSFON Merch',
  },
  description: 'Premium merch for the TACSFON community.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    siteName: 'TACSFON Merch',
    type:     'website',
  },
  robots: {
    index:     true,
    follow:    true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${urbanist.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background:   'var(--color-surface)',
              border:       '1px solid var(--color-border)',
              color:        'var(--color-text-primary)',
              fontFamily:   'var(--font-inter)',
              fontSize:     '0.875rem',
              borderRadius: '0',
            },
          }}
        />
      </body>
    </html>
  )
}
