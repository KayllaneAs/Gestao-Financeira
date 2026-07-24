'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import MonthSelector from '@/components/MonthSelector'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { SkeletonStats, SkeletonChart } from '@/components/Skeleton'
import { formatCurrency, CHART_COLORS } from '@/utils/helpers'
import { cn } from '@/utils/cn'
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, Receipt
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [resumo, setResumo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
  }, [user, router])

  const fetchResumo = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get(`/dashboard/usuario/${user.Id_Usuario}/resumo-mensal`, { params: { mes, ano } })
      setResumo(data.data)
    } catch { setResumo(null) }
    setLoading(false)
  }, [user, mes, ano])

  useEffect(() => { fetchResumo() }, [fetchResumo])

  if (!user) return null

  return (
    <Layout>
      <div className="fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Olá, <span className="text-[var(--color-primary)] font-semibold">{user?.Nome?.split(' ')[0]}</span>! 
              Aqui está seu resumo financeiro.
            </p>
          </div>
          <MonthSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
        </div>

        {loading ? (
          <>
            <SkeletonStats count={3} className="mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SkeletonChart />
              <SkeletonChart />
            </div>
          </>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              <StatCard
                icon={TrendingUp} 
                label="Total Rendas" 
                color="emerald"
                value={formatCurrency(resumo?.total_rendas || 0)}
                sub={<><ArrowUpRight size={14} /> Receitas do mês</>}
              />
              <StatCard
                icon={TrendingDown} 
                label="Total Despesas" 
                color="rose"
                value={formatCurrency(resumo?.total_despesas || 0)}
                sub={<><ArrowDownRight size={14} /> Gastos do mês</>}
              />
              <StatCard
                icon={Wallet} 
                label="Saldo Líquido"
                color={(resumo?.saldo_liquido || 0) >= 0 ? 'indigo' : 'rose'}
                value={formatCurrency(resumo?.saldo_liquido || 0)}
                sub={<>{(resumo?.saldo_liquido || 0) >= 0 ? 'Positivo' : 'Negativo'}</>}
                className="sm:col-span-2 lg:col-span-1"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pie Chart - Despesas por Categoria */}
              <Card variant="glass" className="slide-up stagger-1 animate-ready">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Receipt size={18} className="text-[var(--color-primary)]" />
                    Despesas por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumo?.despesas_por_categoria?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={resumo.despesas_por_categoria.map(c => ({ name: c.categoria, value: Number(c.total) }))}
                          cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                          paddingAngle={3} dataKey="value" stroke="none"
                        >
                          {resumo.despesas_por_categoria.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 10,
                            color: 'var(--color-text)',
                            fontSize: '.85rem'
                          }}
                          labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}
                          itemStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
                          formatter={(v) => formatCurrency(v)}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '.8rem', color: 'var(--color-text-secondary)' }}
                          formatter={(val) => <span className="text-[var(--color-text-secondary)]">{val}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState icon={Receipt} title="Sem despesas" description="Nenhuma despesa registrada neste mês" />
                  )}
                </CardContent>
              </Card>

              {/* Top 5 Despesas */}
              <Card variant="glass" className="slide-up stagger-2 animate-ready">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LayoutDashboard size={18} className="text-[var(--color-primary)]" />
                    Top 5 Maiores Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumo?.top_5_despesas?.length > 0 ? (
                    <div className="space-y-3">
                      {resumo.top_5_despesas.map((d, i) => (
                        <div 
                          key={d.Id_Despesa || i} 
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-xl",
                            "bg-[var(--color-surface-3)]/30 border border-[var(--color-border)]/50",
                            "hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-3)]/50",
                            "transition-all duration-200"
                          )}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ 
                              background: `${CHART_COLORS[i]}22`, 
                              color: CHART_COLORS[i]
                            }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate text-[var(--color-text)]">
                              {d.Descricao_Despesa}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" size="sm">{d.Categoria}</Badge>
                              {d.conta?.Nome_Conta && (
                                <span className="text-xs text-[var(--color-text-muted)]">{d.conta.Nome_Conta}</span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-[var(--color-danger)] text-sm flex-shrink-0">
                            {formatCurrency(d.Valor_Parcela)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Receipt} title="Sem despesas" description="Nenhuma despesa para exibir" />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

function StatCard({ icon: Icon, label, value, color, sub, className }) {
  const colorClasses = {
    emerald: 'border-[color-mix(in_srgb,var(--color-success)_45%,var(--color-border))] hover:shadow-[var(--color-success)]/10',
    rose: 'border-[color-mix(in_srgb,var(--color-danger)_40%,var(--color-border))] hover:shadow-[var(--color-danger)]/10',
    indigo: 'border-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-border))] hover:shadow-[var(--color-primary)]/10',
  }

  const iconColorClasses = {
    emerald: 'text-[var(--color-success)]',
    rose: 'text-[var(--color-danger)]',
    indigo: 'text-[var(--color-primary)]',
  }

  return (
    <Card 
      hover 
      variant="glass"
      className={cn(
        'group',
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--color-text-muted)] font-medium">{label}</span>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-[var(--color-surface-3)]/60 group-hover:scale-110 transition-transform",
          iconColorClasses[color]
        )}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-2xl font-extrabold mb-1 text-[var(--color-text)]">{value}</div>
      <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">{sub}</div>
    </Card>
  )
}
