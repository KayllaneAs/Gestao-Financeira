'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { cn } from '@/utils/cn'
import { Button } from './Button'

export default function Modal({
  title,
  description,
  children,
  onClose,
  wide,
  className,
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-[var(--color-surface)]/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center fade-in"
      onClick={onClose}
    >
      <div className="w-full min-h-full flex items-center justify-center p-4 sm:p-6 py-12 pointer-events-none">
        <div
          className={cn(
            'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]',
            'rounded-2xl shadow-xl backdrop-blur-2xl',
            'p-6 w-full pointer-events-auto',
            'scale-in',
            wide ? 'max-w-2xl' : 'max-w-lg',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
                {title}
              </h3>

              {description && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {description}
                </p>
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
    </div>,
    document.body
  )
}