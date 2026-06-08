'use client'

import { cn } from '@/utils/cn'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-11 h-11 border-3',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className={cn('flex justify-center items-center p-10', className)}>
      <div className="relative">
        {/* Outer glow */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full blur-md opacity-40',
            'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]'
          )}
          style={{ animation: 'pulseSoft 2s ease-in-out infinite' }}
        />
        {/* Spinner */}
        <div 
          className={cn(
            'relative rounded-full',
            'border-[color-mix(in_srgb,var(--color-primary)_20%,var(--color-surface-3))]',
            'border-t-[var(--color-primary)] border-r-[var(--color-accent)]',
            sizes[size]
          )}
          style={{ 
            animation: 'spin 0.8s linear infinite',
            boxShadow: '0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent)'
          }}
        />
      </div>
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ message = 'Carregando...' }) {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-surface)]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 fade-in">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-medium text-[var(--color-text-muted)] animate-pulse">
        {message}
      </p>
    </div>
  )
}
