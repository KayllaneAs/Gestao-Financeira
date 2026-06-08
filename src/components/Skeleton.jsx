'use client'

import { cn } from '@/utils/cn'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-[var(--color-surface-3)]/60 via-[var(--color-surface-3)] to-[var(--color-surface-3)]/60 bg-[length:200%_100%]',
        className
      )}
      style={{ animation: 'shimmer 1.5s infinite' }}
      {...props}
    />
  )
}

function SkeletonText({ className, lines = 1, ...props }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, columns = 4, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="flex gap-4 p-4 border-b border-[var(--color-border)]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-[var(--color-border)]/50 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn('h-4 flex-1', colIndex === 0 && 'max-w-[200px]')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonStats({ count = 4, className, ...props }) {
  return (
    <div
      className={cn('grid gap-4 grid-cols-2 lg:grid-cols-4', className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

function SkeletonChart({ className, ...props }) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-end justify-around gap-2 h-48">
        {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonStats, SkeletonChart }
