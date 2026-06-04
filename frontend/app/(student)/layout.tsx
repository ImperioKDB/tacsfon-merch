import type { ReactNode } from 'react'
import Navbar    from '@/components/layout/Navbar'
import Footer    from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px', paddingBottom: '60px' }}>
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
