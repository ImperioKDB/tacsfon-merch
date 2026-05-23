'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingBag, User, Menu, X, LogIn } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { createBrowserClient } from '@/lib/supabase/browser'
import NotificationBell from '@/components/notifications/NotificationBell'

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/contact' },
]

export default function Navbar() {
  const supabase = createBrowserClient()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [session, setSession] = useState(null)
  const cartCount = useCartStore((s) => s.count)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    window.onscroll = () => setScrolled(window.scrollY > 20)
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDrawerOpen(false)
    window.location.href = '/'
  }

  return (
    <header style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || drawerOpen ? 'var(--color-surface)' : 'rgba(10,10,15,0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--color-border)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Fixed Home Button */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text-primary)', letterSpacing: '1px' }}>TACSFON</span>
          <div style={{ width: '6px', height: '6px', background: 'var(--color-gold)' }} />
        </Link>

        {/* Desktop Links */}
        <nav style={{ display: 'flex', gap: '30px' }} className="hidden md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {session && <NotificationBell />}
          <Link href="/cart" style={{ position: 'relative', color: 'var(--color-text-primary)' }}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--color-gold)', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>{cartCount}</span>}
          </Link>

          {/* User / Auth Buttons */}
          {session ? (
            <Link href="/profile" style={{ color: 'var(--color-text-primary)' }}><User size={20} /></Link>
          ) : (
            <div className="hidden md:flex" style={{ gap: '10px' }}>
               <Link href="/login" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--color-border)' }}>LOG IN</Link>
               <Link href="/signup" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#000', background: 'var(--color-gold)', textDecoration: 'none', padding: '8px 16px' }}>SIGN UP</Link>
            </div>
          )}

          <button onClick={() => setDrawerOpen(!drawerOpen)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)' }} className="md:hidden">
            {drawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {drawerOpen && (
        <div style={{ position: 'fixed', top: '72px', left: 0, right: 0, bottom: 0, background: 'var(--color-bg)', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 99 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setDrawerOpen(false)} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
          {!session && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Link href="/signup" onClick={() => setDrawerOpen(false)} style={{ background: 'var(--color-gold)', color: '#000', textAlign: 'center', padding: '15px', fontWeight: 'bold', textDecoration: 'none' }}>CREATE ACCOUNT</Link>
              <Link href="/login" onClick={() => setDrawerOpen(false)} style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', textAlign: 'center', padding: '15px', fontWeight: 'bold', textDecoration: 'none' }}>LOG IN</Link>
            </div>
          )}
          {session && <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--color-error)', textAlign: 'left', fontSize: '1.2rem', fontWeight: 'bold' }}>SIGN OUT</button>}
        </div>
      )}
    </header>
  )
}
