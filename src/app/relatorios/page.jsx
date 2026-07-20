'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, getMonthName, CHART_COLORS } from '@/utils/helpers'
import {
  FileBarChart, Download, Search as SearchIcon, TrendingUp, TrendingDown,
  Wallet, BarChart3
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell
} from 'recharts'

export default function Relatorios() {
  const { user } = useAuth()
  const router = useRouter()
  const [ano, setAno] = useState(new Date().getFullYear())
  const [relatorio, setRelatorio] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchRelatorio = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get(`/dashboard/usuario/${user.Id_Usuario}/relatorio-anual`, { params: { ano } })
      setRelatorio(data.data)
      setLoaded(true)
    } catch { setRelatorio(null); setLoaded(true) }
    setLoading(false)
  }, [user, ano])

  const exportCSV = async () => {
    try {
      const { data } = await api.get(`/dashboard/usuario/${user.Id_Usuario}/relatorio-anual/csv`, {
        params: { ano }, responseType: 'blob',
      })
      const url = URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a'); a.href = url
      a.download = `relatorio-anual-${ano}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch { }
  }

  const evolucaoData = relatorio?.evolucao_mensal?.map(m => ({
    name: getMonthName(m.mes).substring(0, 3),
    Rendas: Number(m.total_rendas),
    Despesas: Number(m.total_despesas),
    Saldo: Number(m.saldo),
  })) || []

  const catData = relatorio?.despesas_por_categoria?.map(c => ({
    name: c.categoria, valor: Number(c.total),
  })).sort((a, b) => b.valor - a.valor) || []

  if (!user) return null

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Relatórios</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Análise financeira anual completa</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select className="input-field" style={{ margin: 0, width: 120, cursor: 'pointer' }}
              value={ano} onChange={e => setAno(parseInt(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={fetchRelatorio} disabled={loading}>
              <SearchIcon size={16} /> {loading ? 'Carregando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><LoadingSpinner /></div>}

        {!loading && !loaded && (
          <EmptyState icon={FileBarChart} title="Selecione o ano" description="Escolha um ano e clique em Gerar Relatório" />
        )}

        {!loading && loaded && !relatorio && (
          <EmptyState icon={FileBarChart} title="Sem dados" description="Nenhum dado encontrado para este ano" />
        )}

        {!loading && relatorio && (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <div className="stat-card stat-card-emerald">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingUp size={20} />
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Receita Anual</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatCurrency(relatorio.resumo?.total_rendas || 0)}</div>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card-rose">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendingDown size={20} />
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Despesas Anuais</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatCurrency(relatorio.resumo?.total_despesas || 0)}</div>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card-indigo">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Wallet size={20} />
                  <div>
                    <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Saldo Final</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatCurrency(relatorio.resumo?.saldo_final || 0)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evolução Mensal Line Chart */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={18} style={{ color: 'var(--color-primary-light)' }} />
                  Evolução Mensal — {ano}
                </h3>
                <button className="btn-secondary" onClick={exportCSV}><Download size={15} /> Exportar CSV</button>
              </div>
              {evolucaoData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={evolucaoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: '.85rem' }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '.82rem', color: 'var(--color-text-secondary)' }}
                      formatter={(val) => <span style={{ color: 'var(--color-text-secondary)' }}>{val}</span>}
                    />
                    <Line type="monotone" dataKey="Rendas" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Despesas" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={BarChart3} title="Sem evolução" description="Sem dados mensais" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
              {/* Despesas por Categoria */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Despesas por Categoria</h3>
                {catData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={catData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={v => `R$${v}`} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
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
                      <Bar dataKey="valor" name="Valor" radius={[0, 4, 4, 0]}>
                        {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState icon={FileBarChart} title="Sem dados" description="Nenhuma despesa categorizada" />}
              </div>

              {/* Despesas por Conta */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Despesas por Conta</h3>
                {relatorio.despesas_por_conta?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {relatorio.despesas_por_conta.map((c, i) => {
                      const maxVal = Math.max(...relatorio.despesas_por_conta.map(x => Number(x.total)))
                      const pct = maxVal > 0 ? (Number(c.total) / maxVal) * 100 : 0
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 12, height: 12, borderRadius: '50%',
                                background: c.conta?.Cor_Hex || CHART_COLORS[i], flexShrink: 0,
                              }} />
                              <span style={{ fontSize: '.88rem', fontWeight: 500 }}>{c.conta?.Nome_Conta || 'Conta'}</span>
                              <span style={{ fontSize: '.73rem', color: 'var(--color-text-muted)' }}>({c.quantidade} lançamentos)</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{formatCurrency(c.total)}</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%', borderRadius: 3,
                              background: c.conta?.Cor_Hex || CHART_COLORS[i],
                              transition: 'width .5s ease',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : <EmptyState icon={Wallet} title="Sem dados" description="Nenhuma despesa por conta" />}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
