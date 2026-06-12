'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDate } from '@/utils/helpers'
import {
  Users, ShieldCheck, TrendingDown, TrendingUp,
  CreditCard, Target, Trash2, Crown, UserCheck,
  RefreshCw, AlertTriangle, X, Check
} from 'lucide-react'

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCargo, setModalCargo] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/login'); return }
    if (user.Cargo !== 'admin') { router.push('/'); return }
  }, [user, loading, router])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    if (!user || user.Cargo !== 'admin') return
    setLoading(true)
    try {
      const [statsRes, usuariosRes] = await Promise.all([
      api.get('/admin/stats'),      // <- essa rota não existe ainda
      api.get('/admin/usuarios')
    ])
      setStats(statsRes.data.data)
      setUsuarios(usuariosRes.data.data)
    } catch {
      showToast('Erro ao carregar dados do painel', 'error')
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAtualizarCargo = async () => {
    if (!modalCargo) return
    setActionLoading(true)
    try {
      const novoCargo = modalCargo.usuario.Cargo === 'admin' ? 'usuario' : 'admin'
      await api.put(`/admin/usuarios/${modalCargo.usuario.Id_Usuario}/cargo`, { cargo: novoCargo })
      showToast(`Cargo de ${modalCargo.usuario.Nome} atualizado para ${novoCargo}`)
      setModalCargo(null)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao atualizar cargo', 'error')
    }
    setActionLoading(false)
  }

  const handleDeletar = async () => {
    if (!modalDelete) return
    setActionLoading(true)
    try {
      await api.delete(`/admin/usuarios/${modalDelete.Id_Usuario}`)
      showToast(`Usuário ${modalDelete.Nome} deletado com sucesso`)
      setModalDelete(null)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao deletar usuário', 'error')
    }
    setActionLoading(false)
  }

  if (!user || user.Cargo !== 'admin') return null
  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <LoadingSpinner />
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '14px 20px', borderRadius: 12, fontWeight: 600, fontSize: '.9rem',
          background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)',
          color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn .3s ease'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
          {toast.message}
        </div>
      )}

      <div style={{ animation: 'fadeIn .4s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={30} />
              Painel Admin
            </h1>
            <p style={{ fontSize: '.9rem', color: 'var(--color-text-secondary)', opacity: 0.9 }}>
              Gerencie usuários e visualize estatísticas do sistema.
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '.875rem', fontWeight: 500
            }}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon={Users} label="Total Usuários" value={stats.totalUsuarios} color="indigo" />
            <StatCard icon={Crown} label="Admins" value={stats.totalAdmins} color="emerald" />
            <StatCard icon={TrendingDown} label="Total Despesas" value={stats.totalDespesas} color="rose" sub={formatCurrency(stats.volumeTotalDespesas)} />
            <StatCard icon={TrendingUp} label="Total Rendas" value={stats.totalRendas} color="emerald" sub={formatCurrency(stats.volumeTotalRendas)} />
            <StatCard icon={CreditCard} label="Contas/Cartões" value={stats.totalContas} color="indigo" />
            <StatCard icon={Target} label="Reservas" value={stats.totalReservas} color="indigo" />
          </div>
        )}

        {/* Tabela de Usuários */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: 'var(--color-primary-light)' }} />
            Usuários do Sistema ({usuarios.length})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Nome', 'Email', 'Cargo', 'Cadastro', 'Ações'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '10px 14px',
                      color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '.8rem',
                      textTransform: 'uppercase', letterSpacing: '.04em'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.Id_Usuario} style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          background: u.Cargo === 'admin' ? 'rgba(16,185,129,0.15)' : 'var(--color-surface-3)',
                          border: `1px solid ${u.Cargo === 'admin' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.8rem', fontWeight: 700,
                          color: u.Cargo === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          flexShrink: 0
                        }}>
                          {u.Nome?.charAt(0)?.toUpperCase()}
                        </div>
                        {u.Nome}
                        {u.Id_Usuario === user.Id_Usuario && (
                          <span style={{
                            fontSize: '.7rem', padding: '2px 7px', borderRadius: 6,
                            background: 'rgba(99,102,241,.15)', color: '#818cf8',
                            fontWeight: 600
                          }}>você</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: 'var(--color-text-secondary)' }}>{u.Email}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 8, fontSize: '.78rem', fontWeight: 600,
                        background: u.Cargo === 'admin' ? 'rgba(16,185,129,.15)' : 'rgba(148,163,184,.1)',
                        color: u.Cargo === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: `1px solid ${u.Cargo === 'admin' ? 'rgba(16,185,129,.3)' : 'var(--color-border)'}`
                      }}>
                        {u.Cargo === 'admin' ? <Crown size={12} /> : <UserCheck size={12} />}
                        {u.Cargo === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: 'var(--color-text-muted)', fontSize: '.82rem' }}>
                      {u.Data_Criacao ? formatDate(u.Data_Criacao) : '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {u.Id_Usuario !== user.Id_Usuario && (
                          <>
                            <button
                              onClick={() => setModalCargo({ usuario: u })}
                              title={u.Cargo === 'admin' ? 'Remover admin' : 'Tornar admin'}
                              style={{
                                padding: '7px 12px', borderRadius: 8,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface-2)',
                                color: u.Cargo === 'admin' ? 'var(--color-warning, #f59e0b)' : 'var(--color-primary)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                fontSize: '.8rem', fontWeight: 500
                              }}
                            >
                              <Crown size={14} />
                              {u.Cargo === 'admin' ? 'Remover admin' : 'Tornar admin'}
                            </button>
                            <button
                              onClick={() => setModalDelete(u)}
                              title="Deletar usuário"
                              style={{
                                padding: '7px 10px', borderRadius: 8,
                                border: '1px solid rgba(239,68,68,.3)',
                                background: 'rgba(239,68,68,.08)',
                                color: 'var(--color-danger)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usuários recentes */}
        {stats?.usuariosRecentes?.length > 0 && (
          <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={18} style={{ color: 'var(--color-primary-light)' }} />
              Cadastros Recentes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.usuariosRecentes.map(u => (
                <div key={u.Id_Usuario} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.8rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0
                  }}>
                    {u.Nome?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{u.Nome}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>{u.Email}</div>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
                    {u.Data_Criacao ? formatDate(u.Data_Criacao) : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal - Atualizar Cargo */}
      {modalCargo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setModalCargo(null)}>
          <div style={{
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            borderRadius: 16, padding: 28, maxWidth: 420, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crown size={20} style={{ color: 'var(--color-primary)' }} />
                Alterar Cargo
              </h3>
              <button onClick={() => setModalCargo(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              {modalCargo.usuario.Cargo === 'admin'
                ? <>Remover privilégios de admin de <strong style={{ color: 'var(--color-text)' }}>{modalCargo.usuario.Nome}</strong>? O usuário perderá acesso ao painel de administração.</>
                : <>Promover <strong style={{ color: 'var(--color-text)' }}>{modalCargo.usuario.Nome}</strong> a administrador? O usuário terá acesso completo ao painel de admin.</>
              }
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalCargo(null)} style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleAtualizarCargo} disabled={actionLoading} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 600,
                opacity: actionLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8
              }}>
                {actionLoading && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Deletar Usuário */}
      {modalDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setModalDelete(null)}>
          <div style={{
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            borderRadius: 16, padding: 28, maxWidth: 420, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} />
                Deletar Usuário
              </h3>
              <button onClick={() => setModalDelete(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Tem certeza que deseja deletar <strong style={{ color: 'var(--color-text)' }}>{modalDelete.Nome}</strong>?
              <br />
              <span style={{ color: 'var(--color-danger)', fontSize: '.85rem', marginTop: 8, display: 'block' }}>
                Esta ação é irreversível e removerá todos os dados do usuário (despesas, rendas, contas, etc).
              </span>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalDelete(null)} style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500
              }}>
                Cancelar
              </button>
              <button onClick={handleDeletar} disabled={actionLoading} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: 'var(--color-danger)', color: '#fff', cursor: 'pointer', fontWeight: 600,
                opacity: actionLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8
              }}>
                {actionLoading && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: sub ? 2 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  )
}
