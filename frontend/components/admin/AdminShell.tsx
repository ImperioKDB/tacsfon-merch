'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ClipboardList, CheckCircle, Truck, Package, ScrollText, ShoppingBag, Tag, Users, Receipt, FileSearch, Menu, Store, LogOut } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'

const NAV = [
  { label: 'Pending Orders', href: '/admin',            icon: ClipboardList },
  { label: 'Confirmed',      href: '/confirmed',        icon: CheckCircle   },
  { label: 'Dispatched',     href: '/dispatched',       icon: Truck         },
  { label: 'Completed',      href: '/completed',        icon: Package       },
  { label: 'All Orders',     href: '/history',          icon: ScrollText    },
  { label: 'Products',       href: '/admin/products',   icon: ShoppingBag   },
  { label: 'Categories',     href: '/categories',       icon: Tag           },
  { label: 'Admins',         href: '/admins',           icon: Users         },
  { label: 'Receipts',       href: '/receipts',         icon: Receipt       },
  { label: 'Audit Logs',     href: '/logs',             icon: FileSearch    },
]

export default function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  async function signOut() {
    await createBrowserClient().auth.signOut()
    router.push('/login')
  }

  const sidebar = (
    <nav style={{ width: '260px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '30px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontFamily: 'var(--font-urbanist)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>ADMIN<span className="text-white">.</span></span>
      </div>
      <div style={{ padding: '15px 10px', flex: 1 }}>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', marginBottom: '4px', fontFamily: 'var(--font-inter)', fontSize: '0.8rem', fontWeight: active ? 800 : 500, color: active ? 'white' : 'var(--color-text-secondary)', background: active ? 'var(--color-gold)' : 'transparent', textDecoration: 'none', transition: '0.2s' }}
              className={active ? 'text-black shadow-lg shadow-gold/20' : 'hover:bg-white/5'}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />{label}
            </Link>
          )
        })}
      </div>
    </nav>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="hidden md:flex" style={{ position: 'sticky', top: 0, height: '100vh' }}>{sidebar}</div>
      {open && (
        <div style={{ position: 'fixed', inset: 0, z_index: 200 }} className="z-[200]">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '260px' }}>{sidebar}</div>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setOpen(true)} className="md:hidden text-white"><Menu size={24}/></button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2"><Store size={14}/> Store</Link>
            <button onClick={signOut} className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"><LogOut size={14}/> Exit</button>
          </div>
        </header>
        <main style={{ flex: 1, padding: '40px' }}>{children}</main>
      </div>
    </div>
  )
}
