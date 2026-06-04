'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses: Record<string, string> = {
  primary: [
    'bg-gold text-bg border border-gold',
    'hover:bg-gold-light hover:border-gold-light',
    'hover:shadow-[0 0 20px rgba(61,186,111,0.3)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-gold border border-gold',
    'hover:bg-gold-muted',
  ].join(' '),
  danger: [
    'bg-error text-white border border-error',
    'hover:opacity-90',
  ].join(' '),
  text: [
    'bg-transparent text-text-secondary border border-transparent',
    'hover:text-text-primary',
  ].join(' '),
}

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-2 text-[0.6875rem] min-h-[36px]',
  md: 'px-6 py-3 text-[0.75rem]  min-h-[44px]',
  lg: 'px-8 py-4 text-[0.8125rem] min-h-[56px]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-body font-medium tracking-[0.12em] uppercase',
        'transition-all duration-fast',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" strokeWidth={2} />}
      {children}
    </button>
  )
})

export default Button