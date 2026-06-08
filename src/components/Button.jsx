'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

// Button variants usando classes CSS customizadas
const variants = {
  primary: 'bg-gradient-to-br from-[var(--color-primary)] to-[color-mix(in_srgb,var(--color-primary)_78%,var(--color-accent))] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  secondary: 'bg-[color-mix(in_srgb,var(--color-surface-3)_80%,transparent)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]',
  danger: 'bg-gradient-to-br from-[var(--color-danger)] to-[#dc2626] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  success: 'bg-gradient-to-br from-[var(--color-success)] to-[#059669] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
  ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]/50 hover:text-[var(--color-text)]',
  outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-3)]/50 hover:border-[var(--color-primary)]/40',
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-5 text-sm rounded-xl',
  lg: 'h-12 px-7 text-base rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-lg',
  'icon-lg': 'h-11 w-11 rounded-xl',
}

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  children, 
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30',
        'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
})
Button.displayName = 'Button'

export { Button }
