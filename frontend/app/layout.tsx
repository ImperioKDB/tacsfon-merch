import type { Metadata } from 'next'
import './styles/globals.css'

export const metadata: Metadata = {
  title:       'TACSFON Merch Store',
  description: 'Premium community merchandise for the TACSFON family at UNIBEN.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/*
          Runs synchronously before React hydrates.
          Reads saved preference and applies data-theme to <html> with zero flash.
          suppressHydrationWarning on <html> is required because the attribute
          value may differ between server render ("dark") and client read.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('tacsfon-theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
