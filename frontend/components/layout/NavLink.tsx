'use client'

/**
 * NavLink — client-side nav anchor with built-in hover state.
 *
 * Why this exists:
 *   In Next.js 14 App Router, Server Components cannot pass event-handler
 *   functions (onMouseEnter, onMouseLeave, onClick, etc.) as props to child
 *   components.  Previously the Navbar was passing these down to individual
 *   link elements, which caused the build error:
 *
 *     "Event handlers cannot be passed to Client Component props"
 *
 *   The fix is to move the hover state entirely inside this component so
 *   no handler is ever passed from a parent.
 *
 * Usage:
 *   import { NavLink } from '@/components/layout/NavLink'
 *   <NavLink href="/products">Products</NavLink>
 */

import Link from 'next/link'
import { useState } from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className = '' }: NavLinkProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      className={className}
      style={{
        color: hovered
          ? 'var(--color-gold-light)'
          : 'var(--color-text-secondary)',
        transition: 'color var(--duration-base) var(--ease-smooth)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  )
}
