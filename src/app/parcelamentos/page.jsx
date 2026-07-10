'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import MonthSelector from '@/components/MonthSelector'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate, getMonthName } from '@/utils/helpers'
import {
  CalendarClock, CreditCard, AlertTriangle, CalendarDays, ChevronDown, ChevronUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Parcelamentos() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('lista')
  const [parcelamentos, setParcelamentos] = useState([])
  const [dividasFuturas, setDividasFuturas] = useState(0)
  const [cronograma, setCronograma] = useState([])
  const [faturas, setFaturas] = useState([])
  const [mesFatura, setMesFatura] = useState(new Date().getMonth() + 1)
  const [anoFatura, setAnoFatura] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [pResp, dResp, cResp] = await Promise.all([
        api.get(`/parcelamentos/usuario/${user.Id_Usuario}`),
        api.get(`/parcelamentos/usuario/${user.Id_Usuario}/dividas-futuras`),
        api.get(`/parcelamentos/usuario/${user.Id_Usuario}/cronograma`),
      ])
      setParcelamentos(pResp.data.data)
      const dividasData = dResp?.data?.data
      const totalDividasFuturas = typeof dividasData === 'number'
        ? dividasData
        : Number(dividasData?.total_dividas_futuras || 0)
      setDividasFuturas(totalDividasFuturas)
      setCronograma(cResp.data.data)
    } catch { }
    setLoading(false)
  }, [user])

  const fetchFaturas = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await api.get(`/parcelamentos/usuario/${user.Id_Usuario}/faturas`, { params: { mes: mesFatura, ano: anoFatura } })
      setFaturas(data.data)
    } catch { setFaturas([]) }
  }, [user, mesFatura, anoFatura])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (tab === 'faturas') fetchFaturas() }, [tab, fetchFaturas])

  const handleDelete = async (p) => {
    if (!confirm(`Deletar parcelamento "${p.Descricao_Parcela}" e todas as parcelas?`)) return
    try { await api.delete(`/parcelamentos/${p.Id_Parcelamento}`); fetchAll() } catch { }
  }

  const tabs = [
    { id: 'lista', label: 'Parcelamentos', icon: CalendarClock },
    { id: 'faturas', label: 'Faturas por Cartão', icon: CreditCard },
    { id: 'cronograma', label: 'Cronograma', icon: CalendarDays },
  ]

  if (!user) return null
  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div></Layout>

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Parcelamentos</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Acompanhe seus parcelamentos e faturas</p>
          </div>
        </div>

        {/* Dividas Futuras Card */}
        <div className="stat-card stat-card-amber" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={22} />
            <div>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Dívidas Futuras (Total a Pagar)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatCurrency(dividasFuturas)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 2 }}>
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                fontWeight: tab === t.id ? 600 : 400, fontSize: '.88rem', transition: 'all .2s',
              }}>
                <Icon size={16} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab: Lista */}
        {tab === 'lista' && (
          parcelamentos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {parcelamentos.map(p => {
                const pago = p.parcelas_pagas || 0
                const total = p.Qtd_Parcelas
                const pct = total > 0 ? (pago / total) * 100 : 0
                const isOpen = expandedId === p.Id_Parcelamento
                return (
                  <div key={p.Id_Parcelamento} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', cursor: 'pointer' }} onClick={() => setExpandedId(isOpen ? null : p.Id_Parcelamento)}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.Descricao_Parcela}</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
                            Início: {formatDate(p.Data_Inicio)} · {formatCurrency(p.Valor_Total)} total
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="badge badge-info">{pago}/{total} pagas</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%', borderRadius: 3,
                          background: pct >= 100 ? 'var(--color-success)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          transition: 'width .5s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '.75rem', color: 'var(--color-text-muted)' }}>
                        <span>{pct.toFixed(0)}% pago</span>
                        <span>Restante: {formatCurrency(p.valor_restante || 0)}</span>
                      </div>
                    </div>
                    {isOpen && p.despesas?.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 22px', background: 'rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {p.despesas.map(d => (
                            <div key={d.Id_Despesa} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="badge badge-default" style={{ fontSize: '.7rem', minWidth: 40, textAlign: 'center' }}>
                                  {d.Numero_Parcela}/{total}
                                </span>
                                <span style={{ fontSize: '.85rem' }}>{formatDate(d.Data)}</span>
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{formatCurrency(d.Valor_Parcela)}</span>
                            </div>
                          ))}
                        </div>
                        <button className="btn-danger" onClick={() => handleDelete(p)}
                          style={{ marginTop: 12, fontSize: '.8rem', padding: '6px 14px' }}>
                          Deletar Parcelamento
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : <EmptyState icon={CalendarClock} title="Sem parcelamentos" description="Crie uma despesa parcelada para começar" />
        )}

        {/* Tab: Faturas */}
        {tab === 'faturas' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <MonthSelector mes={mesFatura} ano={anoFatura} onChange={(m, a) => { setMesFatura(m); setAnoFatura(a) }} />
            </div>
            {faturas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {faturas.map((f, i) => (
                  <div key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: 4, background: f.conta?.Cor_Hex || '#6366f1' }} />
                    <div style={{ padding: '18px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: `${f.conta?.Cor_Hex || '#6366f1'}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CreditCard size={18} style={{ color: f.conta?.Cor_Hex || '#6366f1' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{f.conta?.Nome_Conta || 'Conta'}</div>
                            <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
                              {f.conta?.Tipo} {f.conta?.Ultimos_Digitos ? `•••${f.conta.Ultimos_Digitos}` : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-danger)' }}>{formatCurrency(f.total_fatura)}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>{f.quantidade_itens} itens</div>
                        </div>
                      </div>
                      {f.despesas?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {f.despesas.map((d, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                            }}>
                              <div>
                                <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{d.Descricao_Despesa}</div>
                                <div style={{ fontSize: '.73rem', color: 'var(--color-text-muted)' }}>
                                  {d.Categoria} {d.parcela_info ? `· ${d.parcela_info}` : ''}
                                </div>
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{formatCurrency(d.Valor_Parcela)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon={CreditCard} title="Sem faturas" description="Nenhuma fatura neste mês" />}
          </div>
        )}

        {/* Tab: Cronograma */}
        {tab === 'cronograma' && (
          cronograma.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {cronograma.map((m, i) => {
                const [cronAno, cronMes] = (m.mes || '').split('-')
                return (
                  <div key={i} className="glass-card" style={{ padding: '18px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {getMonthName(parseInt(cronMes))} {cronAno}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(m.total)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {m.parcelas?.map((p, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                        }}>
                          <div>
                            <span style={{ fontSize: '.85rem', fontWeight: 500 }}>{p.descricao}</span>
                            <span style={{ fontSize: '.73rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>Parcela {p.parcela}</span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{formatCurrency(p.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <EmptyState icon={CalendarDays} title="Cronograma vazio" description="Nenhuma parcela futura encontrada" />
        )}
      </div>
    </Layout>
  )
}
