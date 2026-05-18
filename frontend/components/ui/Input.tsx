'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.625rem] uppercase tracking-[0.16em] text-text-secondary font-body font-medium"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full bg-surface border border-border',
          'px-4 py-3 text-sm font-body text-text-primary',
          'placeholder:text-text-disabled',
          'transition-colors duration-fast',
          'focus:outline-none focus:border-gold',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-error focus:border-error',
          className,
        )}
        {...props}
      />
      {error && <p className="text-[0.6875rem] text-error font-body">{error}</p>}
      {hint && !error && <p className="text-[0.6875rem] text-text-secondary font-body">{hint}</p>}
    </div>
  )
})

export default Input