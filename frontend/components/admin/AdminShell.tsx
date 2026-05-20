'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ClipboardList, CheckCircle, Truck, Package, ScrollText, ShoppingBag, Tag, Users, Receipt, FileSearch, Menu, Store, LogOut } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/browser'

const NAV = [
  { label: 'Pending Orders', href: '/admin',            icon: ClipboardList },
  { label: 'Confirmed',      href: '/admin/confirmed',  icon: CheckCircle   },
  { label: 'Dispatched',     href: '/admin/dispatched', icon: Truck         },
  { label: 'Completed',      href: '/admin/completed',  icon: Package       },
  { label: 'All Orders',     href: '/admin/history',    icon: ScrollText    },
  { label: 'Products',       href: '/admin/products',   icon: ShoppingBag   },
  { label: 'Categories',     href: '/admin/categories', icon: Tag           },
  { label: 'Admins',         href: '/admin/admins',     icon: Users         },
  { label: 'Receipts',       href: '/admin/receipts',   icon: Receipt       },
  { label: 'Audit Logs',     href: '/admin/logs',       icon: FileSearch    },
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
    <nav style={{ width: '240px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>Admin</span>
        <span style={{ width: '5px', height: '5px', background: 'var(--color-gold)', display: 'inline-block' }} />
      </div>
      <div style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', marginBottom: '2px', fontFamily: 'var(--font-inter)', fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)', background: active ? 'var(--color-gold-muted)' : 'transparent', borderLeft: active ? '2px solid var(--color-gold)' : '2px solid transparent', textDecoration: 'none', transition: 'all var(--duration-fast) var(--ease-smooth)' }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)'; (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-surface-2)' }}}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}}>
              <Icon size={15} strokeWidth={1.5} style={{ flexShrink: 0 }} />{label}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '240px' }}>{sidebar}</div>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
          <button onClick={() => setOpen(o => !o)} className="flex md:hidden" style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: '4px', display: 'flex' }} aria-label="Menu"><Menu size={20} strokeWidth={1.5} /></button>
          <div className="hidden md:block" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-inter)' }}>{adminName}</span>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-inter)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}>
              <Store size={14} strokeWidth={1.5} />View Store
            </Link>
            <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-error)', fontFamily: 'var(--font-inter)', padding: 0 }}>
              <LogOut size={14} strokeWidth={1.5} />Sign Out
            </button>
          </div>
        </header>
        <main style={{ flex: 1, padding: '28px 24px', overflowX: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}