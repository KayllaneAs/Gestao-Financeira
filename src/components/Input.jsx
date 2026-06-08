'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const inputVariants = {
  default: 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/15',
  error: 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/15',
  success: 'border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/15',
}

const inputSizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-5 text-base',
}

const Input = forwardRef(({ className, type, variant = 'default', size = 'md', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full rounded-xl border bg-[color-mix(in_srgb,var(--color-surface-2)_85%,transparent)]',
        'text-[var(--color-text)] transition-all duration-200',
        'placeholder:text-[var(--color-text-muted)] focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        inputVariants[variant],
        inputSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

const Label = forwardRef(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-sm font-semibold text-[var(--color-text-secondary)] mb-2',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
  </label>
))
Label.displayName = 'Label'

const Textarea = forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border bg-[color-mix(in_srgb,var(--color-surface-2)_85%,transparent)]',
        'text-[var(--color-text)] text-sm transition-all duration-200',
        'placeholder:text-[var(--color-text-muted)] focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'min-h-[100px] py-3 px-4 resize-y',
        inputVariants[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

const Select = forwardRef(({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
  return (
    <select
      className={cn(
        'w-full rounded-xl border bg-[color-mix(in_srgb,var(--color-surface-2)_85%,transparent)]',
        'text-[var(--color-text)] transition-all duration-200',
        'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'cursor-pointer appearance-none bg-no-repeat bg-[length:16px] bg-[right_12px_center]',
        'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
        inputVariants[variant],
        inputSizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = 'Select'

const InputGroup = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {children}
  </div>
))
InputGroup.displayName = 'InputGroup'

const InputError = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-[var(--color-danger)] mt-1.5 flex items-center gap-1', className)}
    {...props}
  >
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    {children}
  </p>
))
InputError.displayName = 'InputError'

export { Input, Label, Textarea, Select, InputGroup, InputError }
