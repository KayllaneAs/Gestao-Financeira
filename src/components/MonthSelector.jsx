'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthName } from '@/utils/helpers'

export default function MonthSelector({ mes, ano, onChange }) {
  const prev = () => {
    if (mes === 1) onChange(12, ano - 1)
    else onChange(mes - 1, ano)
  }
  const next = () => {
    if (mes === 12) onChange(1, ano + 1)
    else onChange(mes + 1, ano)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface-elevated)',
      borderRadius: 12,
      padding: '4px 6px',
      backdropFilter: 'blur(8px)',
    }}>
      <button className="btn-icon" onClick={prev} style={{ width: 30, height: 30 }}><ChevronLeft size={16} /></button>
      <span style={{ fontWeight: 700, fontSize: '.9rem', minWidth: 148, textAlign: 'center' }}>
        {getMonthName(mes)} {ano}
      </span>
      <button className="btn-icon" onClick={next} style={{ width: 30, height: 30 }}><ChevronRight size={16} /></button>
    </div>
  )
}
