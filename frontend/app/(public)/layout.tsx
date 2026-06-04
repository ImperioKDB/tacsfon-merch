import type { ReactNode } from 'react'
import Navbar    from '@/components/layout/Navbar'
import Footer    from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {/* pt-16 clears the fixed 64px navbar */}
      <main style={{ paddingTop: '64px', paddingBottom: '60px' }}>
        {children}
      </main>
      <Footer />
      {/* Mobile bottom nav — rendered client-side, hidden on md+ via CSS */}
      <BottomNav />
    </>
  )
}
