'use client'

import { cn } from '@/utils/cn'

const badgeVariants = {
  default: 'bg-[color-mix(in_srgb,var(--color-text-muted)_14%,transparent)] border-[color-mix(in_srgb,var(--color-text-muted)_30%,transparent)] text-[var(--color-text-secondary)]',
  primary: 'bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] text-[var(--color-primary)]',
  success: 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] border-[color-mix(in_srgb,var(--color-success)_35%,transparent)] text-[var(--color-success)]',
  warning: 'bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] text-[var(--color-warning)]',
  danger: 'bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] border-[color-mix(in_srgb,var(--color-danger)_35%,transparent)] text-[var(--color-danger)]',
  info: 'bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] text-[var(--color-accent)]',
  outline: 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)]',
}

const badgeSizes = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

function Badge({ className, variant = 'default', size = 'md', children, icon: Icon, ...props }) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold border transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )} 
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  )
}

export { Badge }
