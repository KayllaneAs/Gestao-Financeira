'use client'

import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Table = forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] backdrop-blur-xl">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

const TableHeader = forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('border-b border-[var(--color-border)]', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-[var(--color-border)] bg-[var(--color-surface-3)]/30 font-medium',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

const TableRow = forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-[var(--color-border)]/50 transition-colors',
      'hover:bg-[var(--color-surface-3)]/50',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-bold text-xs uppercase tracking-wider',
      'text-[var(--color-text-muted)] whitespace-nowrap',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3.5 align-middle text-[var(--color-text-secondary)]',
      className
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableEmpty = forwardRef(({ className, children, colSpan = 1, ...props }, ref) => (
  <tr ref={ref}>
    <td
      colSpan={colSpan}
      className={cn('h-32 text-center text-[var(--color-text-muted)]', className)}
      {...props}
    >
      {children || 'Nenhum registro encontrado'}
    </td>
  </tr>
))
TableEmpty.displayName = 'TableEmpty'

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableEmpty }
