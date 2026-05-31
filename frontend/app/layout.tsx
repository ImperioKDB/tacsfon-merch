import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Urbanist } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-cormorant', display: 'swap' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-inter', display: 'swap' })
const urbanist = Urbanist({ subsets: ['latin'], weight: ['600', '700', '900'], variable: '--font-urbanist', display: 'swap' })

export const metadata: Metadata = {
  title: 'TACSFON Merch',
  description: 'Premium community merchandise.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${urbanist.variable}`}>
      <body className="font-body antialiased bg-[#0A0A0F] text-[#F7F5F0]">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
