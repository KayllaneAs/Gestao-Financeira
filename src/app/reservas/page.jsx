'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate } from '@/utils/helpers'
import {
  Plus, Pencil, Trash2, Target, ArrowUpCircle, ArrowDownCircle, Calendar
} from 'lucide-react'

const emptyForm = { Nome_Objetivo: '', Valor_Alvo: '', Valor_Atual: 0, Data_Limite: '' }

export default function Reservas() {
  const { user } = useAuth()
  const router = useRouter()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [aporteModal, setAporteModal] = useState(null)
  const [aporteValor, setAporteValor] = useState('')
  const [aporteSaving, setAporteSaving] = useState(false)

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get(`/reservas/usuario/${user.Id_Usuario}`)
      setReservas(data.data)
    } catch { }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setForm(emptyForm); setEditing(null); setError(''); setModal(true) }
  const openEdit = (r) => {
    setForm({ Nome_Objetivo: r.Nome_Objetivo, Valor_Alvo: r.Valor_Alvo, Valor_Atual: r.Valor_Atual, Data_Limite: r.Data_Limite || '' })
    setEditing(r); setError(''); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const body = { ...form, Valor_Alvo: parseFloat(form.Valor_Alvo), Data_Limite: form.Data_Limite || null }
      if (editing) { await api.put(`/reservas/${editing.Id_Reserva}`, body) }
      else { await api.post('/reservas', { ...body, Id_Usuario: user.Id_Usuario, Valor_Atual: 0 }) }
      setModal(false); fetchData()
    } catch (err) { setError(err.response?.data?.error || 'Erro ao salvar') }
    setSaving(false)
  }

  const handleDelete = async (r) => {
    if (!confirm(`Deletar reserva "${r.Nome_Objetivo}"?`)) return
    try { await api.delete(`/reservas/${r.Id_Reserva}`); fetchData() } catch { }
  }

  const handleAporte = async () => {
    if (!aporteValor || parseFloat(aporteValor) <= 0) return
    setAporteSaving(true)
    try {
      await api.put(`/reservas/${aporteModal.reserva.Id_Reserva}/${aporteModal.tipo}`, { valor: parseFloat(aporteValor) })
      setAporteModal(null); setAporteValor(''); fetchData()
    } catch { }
    setAporteSaving(false)
  }

  const totalAlvo = reservas.reduce((s, r) => s + Number(r.Valor_Alvo), 0)
  const totalAtual = reservas.reduce((s, r) => s + Number(r.Valor_Atual), 0)

  if (!user) return null
  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div></Layout>

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Reservas & Objetivos</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Acompanhe suas metas de economia</p>
          </div>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nova Reserva</button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div className="stat-card stat-card-cyan">
            <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Total Reservado</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{formatCurrency(totalAtual)}</div>
          </div>
          <div className="stat-card stat-card-violet">
            <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Meta Total</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{formatCurrency(totalAlvo)}</div>
          </div>
          <div className="stat-card stat-card-indigo">
            <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Progresso Geral</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalAlvo > 0 ? ((totalAtual / totalAlvo) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>

        {/* Cards */}
        {reservas.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {reservas.map(r => {
              const pct = Math.min(Number(r.progresso || 0), 100)
              const atingido = pct >= 100
              return (
                <div key={r.Id_Reserva} className="glass-card" style={{ padding: '22px', position: 'relative', overflow: 'hidden' }}>
                  {atingido && (
                    <div style={{
                      position: 'absolute', top: 12, right: -30, background: 'var(--color-success)',
                      color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '3px 36px',
                      transform: 'rotate(45deg)', zIndex: 1,
                    }}>META</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: atingido ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Target size={20} style={{ color: atingido ? 'var(--color-success)' : 'var(--color-primary-light)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.Nome_Objetivo}</div>
                        {r.Data_Limite && (
                          <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={11} /> Até {formatDate(r.Data_Limite)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" onClick={() => openEdit(r)} title="Editar"><Pencil size={14} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(r)} title="Deletar"
                        style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.85rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Atual</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(r.Valor_Atual)} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {formatCurrency(r.Valor_Alvo)}</span></span>
                  </div>

                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 4,
                      background: atingido ? 'var(--color-success)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      transition: 'width .5s ease',
                    }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                    {pct.toFixed(1)}%
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '.82rem', padding: '8px 12px' }}
                      onClick={() => { setAporteModal({ reserva: r, tipo: 'adicionar' }); setAporteValor('') }}>
                      <ArrowUpCircle size={15} /> Adicionar
                    </button>
                    <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '.82rem', padding: '8px 12px' }}
                      onClick={() => { setAporteModal({ reserva: r, tipo: 'retirar' }); setAporteValor('') }}
                      disabled={Number(r.Valor_Atual) <= 0}>
                      <ArrowDownCircle size={15} /> Retirar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={Target} title="Sem reservas" description="Crie seu primeiro objetivo de economia"
            action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Criar Reserva</button>} />
        )}

        {/* Modal CRUD */}
        {modal && (
          <Modal title={editing ? 'Editar Reserva' : 'Nova Reserva'} onClose={() => setModal(false)}>
            <form onSubmit={handleSave}>
              {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', fontSize: '.85rem' }}>{error}</div>}
              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Nome do Objetivo</label>
                <input className="input-field" required value={form.Nome_Objetivo}
                  onChange={e => setForm({ ...form, Nome_Objetivo: e.target.value })} placeholder="Ex: Viagem, Carro novo..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label className="input-label">Valor Alvo (R$)</label>
                  <input className="input-field" type="number" step="0.01" min="0.01" required
                    value={form.Valor_Alvo} onChange={e => setForm({ ...form, Valor_Alvo: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Data Limite (opcional)</label>
                  <input className="input-field" type="date" value={form.Data_Limite}
                    onChange={e => setForm({ ...form, Data_Limite: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar Reserva'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal Aporte / Retirada */}
        {aporteModal && (
          <Modal title={aporteModal.tipo === 'adicionar' ? 'Adicionar Aporte' : 'Retirar Valor'} onClose={() => setAporteModal(null)}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem', marginBottom: 16 }}>
              {aporteModal.reserva.Nome_Objetivo} — Saldo atual: {formatCurrency(aporteModal.reserva.Valor_Atual)}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label className="input-label">Valor (R$)</label>
              <input className="input-field" type="number" step="0.01" min="0.01"
                max={aporteModal.tipo === 'retirar' ? Number(aporteModal.reserva.Valor_Atual) : undefined}
                value={aporteValor} onChange={e => setAporteValor(e.target.value)} autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setAporteModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAporte} disabled={aporteSaving || !aporteValor}>
                {aporteSaving ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
