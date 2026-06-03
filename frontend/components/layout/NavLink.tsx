'use client'

/**
 * NavLink — active-aware nav anchor.
 * Uses usePathname so the current route is always underlined in gold.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
}

export function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`nav-link${isActive ? ' active' : ''}`}
    >
      {children}
    </Link>
  )
}
