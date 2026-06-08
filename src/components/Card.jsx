'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const cardVariants = {
  default: 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] backdrop-blur-xl shadow-sm',
  glass: 'bg-[var(--color-surface-elevated)]/80 border-[var(--color-border)]/60 backdrop-blur-2xl',
  solid: 'bg-[var(--color-surface-2)] border-[var(--color-border)]',
  outline: 'bg-transparent border-[var(--color-border)] border-dashed',
  gradient: 'bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-3)]/50 border-[var(--color-border)]/50 backdrop-blur-xl',
}

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const Card = forwardRef(({ 
  className, 
  variant = 'default', 
  hover = false,
  padding = 'md',
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border transition-all duration-300',
      cardVariants[variant],
      paddings[padding],
      hover && 'hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)]/30 cursor-pointer',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-bold tracking-tight text-[var(--color-text)]', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[var(--color-text-muted)]', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-[var(--color-border)]/50', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
