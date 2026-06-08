'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import {
  LayoutDashboard, Receipt, TrendingUp, CreditCard, CalendarClock,
  Target, FileBarChart, LogOut, Wallet, Menu, ShieldCheck, FileUp, Users,
  ChevronLeft, X,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/rendas', icon: TrendingUp, label: 'Rendas' },
  { to: '/contas', icon: CreditCard, label: 'Contas' },
  { to: '/membros-familia', icon: Users, label: 'Família' },
  { to: '/parcelamentos', icon: CalendarClock, label: 'Parcelas' },
  { to: '/reservas', icon: Target, label: 'Reservas' },
  { to: '/relatorios', icon: FileBarChart, label: 'Relatórios' },
  { to: '/importar', icon: FileUp, label: 'Importar CSV' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const isAdmin = user?.Cargo === 'admin'
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (to) => {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  const pageName = useMemo(() => {
    const found = navItems.find((item) => isActive(item.to))
    if (isActive('/admin')) return 'Admin'
    return found?.label || 'FinanceApp'
  }, [pathname])

  const NavLink = ({ to, icon: Icon, label, active }) => (
    <Link
      href={to}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
        'transition-all duration-200 border border-transparent',
        collapsed ? 'justify-center' : 'justify-start',
        active 
          ? 'bg-[color-mix(in_srgb,var(--color-primary)_13%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] font-semibold' 
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]/60 hover:text-[var(--color-text)]'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon 
        size={18} 
        className={cn(
          'flex-shrink-0 transition-transform duration-200',
          'group-hover:scale-110',
          active && 'text-[var(--color-primary)]'
        )} 
      />
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
      {active && !collapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
      )}
    </Link>
  )

  return (
    <div className="flex min-h-screen bg-transparent text-[var(--color-text)]">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[rgba(2,6,23,0.6)] backdrop-blur-sm z-40 lg:hidden fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-50',
          'bg-[var(--color-surface-elevated)]/95 backdrop-blur-xl',
          'border-r border-[var(--color-border)]',
          'flex flex-col transition-all duration-300 ease-out',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex-shrink-0',
            'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]',
            'flex items-center justify-center',
            'shadow-lg shadow-[var(--color-primary)]/30',
            'hover-scale transition-transform'
          )}>
            <Wallet size={22} className="text-white" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0 slide-up">
              <span className="text-base font-extrabold tracking-tight">
                Finance<span className="text-[var(--color-primary)]">App</span>
              </span>
              <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">
                Gestão inteligente
              </span>
            </div>
          )}

          {/* Collapse Button - Desktop */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex ml-auto"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft size={16} className={cn(
              'transition-transform duration-300',
              collapsed && 'rotate-180'
            )} />
          </Button>

          {/* Close Button - Mobile */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon, label }) => (
            <NavLink 
              key={to} 
              to={to} 
              icon={icon} 
              label={label} 
              active={isActive(to)} 
            />
          ))}

          {isAdmin && (
            <>
              <div className="h-px bg-[var(--color-border)] my-3 mx-2" />
              <NavLink 
                to="/admin" 
                icon={ShieldCheck} 
                label="Admin" 
                active={isActive('/admin')} 
              />
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl',
            'bg-[var(--color-surface-3)]/50 border border-[var(--color-border)]',
            'hover:border-[var(--color-primary)]/20 transition-colors'
          )}>
            <div className={cn(
              'w-9 h-9 rounded-lg flex-shrink-0',
              'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]',
              'flex items-center justify-center',
              'text-white text-sm font-bold'
            )}>
              {user?.Nome?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-[var(--color-text)]">
                    {user?.Nome}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] truncate">
                    {user?.Email}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={logout} 
                  title="Sair"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                >
                  <LogOut size={16} />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className={cn(
          'h-16 border-b border-[var(--color-border)]',
          'flex items-center justify-between px-4 lg:px-6',
          'sticky top-0 z-30',
          'bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl'
        )}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </Button>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium">
                Workspace
              </p>
              <h1 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
                {pageName}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="fade-in">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}