'use client'

import { cn } from '@/utils/cn'
import { Button } from './Button'

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel,
  onAction,
  className 
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-14 px-6 text-center',
      'border border-dashed border-[var(--color-border)] rounded-2xl',
      'bg-[color-mix(in_srgb,var(--color-surface-2)_72%,transparent)] backdrop-blur-lg',
      'fade-in',
      className
    )}>
      {Icon && (
        <div className={cn(
          'w-16 h-16 rounded-2xl mb-5 flex items-center justify-center',
          'bg-gradient-to-br from-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] to-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]',
          'border border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)]',
          'hover-lift'
        )}>
          <Icon size={28} className="text-[var(--color-primary)]" />
        </div>
      )}
      <h3 className="text-base font-bold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-0">
        {description}
      </p>
      {(action || (actionLabel && onAction)) && (
        <div className="mt-5">
          {action || (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
