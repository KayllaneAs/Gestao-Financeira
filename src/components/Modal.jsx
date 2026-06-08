'use client'

import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export default function Modal({ title, description, children, onClose, wide, className }) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-[rgba(2,6,23,0.55)] backdrop-blur-md flex items-center justify-center p-4 fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]',
          'rounded-2xl shadow-2xl backdrop-blur-2xl',
          'p-6 w-full max-h-[92vh] overflow-y-auto',
          'scale-in',
          wide ? 'max-w-2xl' : 'max-w-lg',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--color-text)]">{title}</h3>
            {description && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onClose}
            className="flex-shrink-0 -mr-2 -mt-1"
          >
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
