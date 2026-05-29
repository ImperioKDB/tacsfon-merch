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
    window.location.href = '/login'
  }

  const sidebar = (
    <nav style={{ width: '280px', background: '#07070a', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '40px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <h2 style={{ color: 'var(--color-gold)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>TACSFON<br/><span style={{ color: 'white' }}>ADMIN</span></h2>
      </div>
      <div style={{ padding: '20px 10px', flex: 1 }}>
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', marginBottom: '4px', color: active ? 'black' : '#888', background: active ? 'var(--color-gold)' : 'transparent', textDecoration: 'none', fontWeight: active ? 900 : 500, fontSize: '0.85rem', transition: '0.2s' }}>
              <item.icon size={18} strokeWidth={active ? 3 : 1.5} /> {item.label}
            </Link>
          )
        })}
      </div>
      <button onClick={signOut} style={{ padding: '20px', background: 'transparent', border: 'none', borderTop: '1px solid #1a1a1a', color: '#ef4444', textAlign: 'left', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em' }}>
         <LogOut size={14} style={{ marginRight: '10px' }}/> SYSTEM EXIT
      </button>
    </nav>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'black' }}>
      <div className="hidden md:block">{sidebar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid #1a1a1a', background: '#07070a' }}>
           <button onClick={() => setOpen(true)} className="md:hidden text-white"><Menu/></button>
           <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{adminName}</div>
           <Link href="/" className="text-gold font-bold text-xs flex items-center gap-2"><Store size={14}/> STOREFRONT</Link>
        </header>
        <main style={{ padding: '40px' }}>{children}</main>
      </div>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100vh' }}>{sidebar}</div>
        </div>
      )}
    </div>
  )
}
