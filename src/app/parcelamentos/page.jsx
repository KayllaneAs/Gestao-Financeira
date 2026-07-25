'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate } from '@/utils/helpers'
import {
  CalendarClock,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Parcelamentos() {
  const { user } = useAuth()
  const router = useRouter()

  const [parcelamentos, setParcelamentos] = useState([])
  const [dividasFuturas, setDividasFuturas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [parcelamentoParaExcluir, setParcelamentoParaExcluir] = useState(null)
  const [deletando, setDeletando] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const fetchAll = useCallback(async () => {
    if (!user) return

    setLoading(true)

    try {
      const [parcelamentosResponse, dividasResponse] = await Promise.all([
        api.get(`/parcelamentos/usuario/${user.Id_Usuario}`),
        api.get(
          `/parcelamentos/usuario/${user.Id_Usuario}/dividas-futuras`
        )
      ])

      setParcelamentos(parcelamentosResponse?.data?.data || [])

      const dividasData = dividasResponse?.data?.data

      const totalDividasFuturas =
        typeof dividasData === 'number'
          ? dividasData
          : Number(dividasData?.total_dividas_futuras || 0)

      setDividasFuturas(totalDividasFuturas)
    } catch (error) {
      console.error('Erro ao buscar parcelamentos:', error)
      setParcelamentos([])
      setDividasFuturas(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const abrirModalExclusao = (event, parcelamento) => {
    event.stopPropagation()
    setParcelamentoParaExcluir(parcelamento)
  }

  const fecharModalExclusao = () => {
    if (deletando) return
    setParcelamentoParaExcluir(null)
  }

  const handleDelete = async () => {
    if (!parcelamentoParaExcluir) return

    try {
      setDeletando(true)

      await api.delete(
        `/parcelamentos/${parcelamentoParaExcluir.Id_Parcelamento}`
      )

      setParcelamentoParaExcluir(null)
      setExpandedId(null)

      await fetchAll()
    } catch (error) {
      console.error('Erro ao deletar parcelamento:', error)
    } finally {
      setDeletando(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 120
          }}
        >
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: 4
              }}
            >
              Parcelamentos
            </h1>

            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '.85rem'
              }}
            >
              Acompanhe seus parcelamentos
            </p>
          </div>
        </div>

        <div
          className="stat-card stat-card-amber"
          style={{ marginBottom: 24 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <AlertTriangle size={22} />

            <div>
              <div
                style={{
                  fontSize: '.85rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)'
                }}
              >
                Dívidas Futuras (Total a Pagar)
              </div>

              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800
                }}
              >
                {formatCurrency(dividasFuturas)}
              </div>
            </div>
          </div>
        </div>

        {parcelamentos.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {parcelamentos.map((parcelamento) => {
              const parcelasPagas = parcelamento.parcelas_pagas || 0
              const totalParcelas = parcelamento.Qtd_Parcelas || 0
              const porcentagem =
                totalParcelas > 0
                  ? (parcelasPagas / totalParcelas) * 100
                  : 0

              const estaAberto =
                expandedId === parcelamento.Id_Parcelamento

              return (
                <div
                  key={parcelamento.Id_Parcelamento}
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '18px 22px',
                      cursor: 'pointer'
                    }}
                    onClick={() =>
                      setExpandedId(
                        estaAberto
                          ? null
                          : parcelamento.Id_Parcelamento
                      )
                    }
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        gap: 12
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}
                        >
                          {parcelamento.Descricao_Parcela}
                        </div>

                        <div
                          style={{
                            fontSize: '.78rem',
                            color: 'var(--color-text-muted)'
                          }}
                        >
                          Início: {formatDate(parcelamento.Data_Inicio)}
                          {' · '}
                          {formatCurrency(parcelamento.Valor_Total)} total
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexShrink: 0
                        }}
                      >
                        <span className="badge badge-info">
                          {parcelasPagas}/{totalParcelas} pagas
                        </span>

                        {estaAberto ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(porcentagem, 100)}%`,
                          height: '100%',
                          borderRadius: 3,
                          background:
                            porcentagem >= 100
                              ? 'var(--color-success)'
                              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          transition: 'width .5s ease'
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 6,
                        fontSize: '.75rem',
                        color: 'var(--color-text-muted)',
                        gap: 12
                      }}
                    >
                      <span>{porcentagem.toFixed(0)}% pago</span>

                      <span>
                        Restante:{' '}
                        {formatCurrency(parcelamento.valor_restante || 0)}
                      </span>
                    </div>
                  </div>

                  {estaAberto &&
                    parcelamento.despesas?.length > 0 && (
                      <div
                        style={{
                          borderTop: '1px solid var(--color-border)',
                          padding: '12px 22px',
                          background: 'rgba(0,0,0,0.15)'
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gap: 8
                          }}
                        >
                          {parcelamento.despesas.map((despesa) => (
                            <div
                              key={despesa.Id_Despesa}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.03)',
                                gap: 12
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10
                                }}
                              >
                                <span
                                  className="badge badge-default"
                                  style={{
                                    fontSize: '.7rem',
                                    minWidth: 40,
                                    textAlign: 'center'
                                  }}
                                >
                                  {despesa.Numero_Parcela}/{totalParcelas}
                                </span>

                                <span style={{ fontSize: '.85rem' }}>
                                  {formatDate(despesa.Data)}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: '.85rem'
                                }}
                              >
                                {formatCurrency(despesa.Valor_Parcela)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="btn-danger"
                          onClick={(event) =>
                            abrirModalExclusao(event, parcelamento)
                          }
                          style={{
                            marginTop: 12,
                            fontSize: '.8rem',
                            padding: '8px 16px'
                          }}
                        >
                          Deletar Parcelamento
                        </button>
                      </div>
                    )}
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="Sem parcelamentos"
            description="Crie uma despesa parcelada para começar"
          />
        )}
      </div>

      {parcelamentoParaExcluir && (
        <div
          onClick={fecharModalExclusao}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(241, 245, 249, 0.78)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-exclusao"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              padding: 26,
              borderRadius: 18,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
              color: '#172033'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 22
              }}
            >
              <h2
                id="titulo-modal-exclusao"
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#172033'
                }}
              >
                Deletar parcelamento
              </h2>

              <button
                type="button"
                disabled={deletando}
                onClick={fecharModalExclusao}
                aria-label="Fechar modal"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: 8,
                  background: 'transparent',
                  color: '#172033',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  cursor: deletando ? 'not-allowed' : 'pointer',
                  opacity: deletando ? 0.5 : 1
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '.95rem',
                lineHeight: 1.5,
                color: '#334155'
              }}
            >
              Tem certeza que deseja deletar o parcelamento{' '}
              <strong style={{ color: '#172033' }}>
                &quot;{parcelamentoParaExcluir.Descricao_Parcela}&quot;
              </strong>{' '}
              e todas as suas parcelas?
            </p>

            <p
              style={{
                margin: '8px 0 0',
                fontSize: '.84rem',
                lineHeight: 1.45,
                color: '#64748b'
              }}
            >
              Essa ação não poderá ser desfeita.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 24,
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                disabled={deletando}
                onClick={fecharModalExclusao}
                style={{
                  minWidth: 120,
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#172033',
                  fontSize: '.9rem',
                  fontWeight: 700,
                  cursor: deletando ? 'not-allowed' : 'pointer',
                  opacity: deletando ? 0.6 : 1
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={deletando}
                onClick={handleDelete}
                style={{
                  minWidth: 165,
                  padding: '12px 18px',
                  border: 'none',
                  borderRadius: 12,
                  background: '#ff424d',
                  color: '#ffffff',
                  fontSize: '.9rem',
                  fontWeight: 700,
                  cursor: deletando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 18px rgba(255, 66, 77, 0.22)',
                  opacity: deletando ? 0.7 : 1
                }}
              >
                {deletando ? 'Deletando...' : 'Deletar parcelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}