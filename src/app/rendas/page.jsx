'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import MonthSelector from '@/components/MonthSelector'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { Plus, Pencil, TrendingUp, Search, Repeat } from 'lucide-react'
import { useRouter } from 'next/navigation'

const emptyForm = {
  Descricao_Renda: '',
  Valor_Renda: '',
  Data: '',
  Fixa: false,
  Dia_Vencimento: '',
}

export default function Rendas() {
  const { user } = useAuth()
  const router = useRouter()
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [rendas, setRendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [confirmModal, setConfirmModal] = useState(null) // { tipo: 'editar', renda, payload }

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get(`/rendas/usuario/${user.Id_Usuario}`, { params: { mes, ano } })
      setRendas(data.data)
    } catch { }
    setLoading(false)
  }, [user, mes, ano])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setForm({ ...emptyForm, Data: `${ano}-${String(mes).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` })
    setEditing(null); setError(''); setModal(true)
  }

  const openEdit = (r) => {
    setForm({
      Descricao_Renda: r.Descricao_Renda,
      Valor_Renda: r.Valor_Renda,
      Data: r.Data,
      Fixa: r.Fixa || false,
      Dia_Vencimento: r.Dia_Vencimento || '',
    })
    setEditing(r); setError(''); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editing && editing.Fixa) {
      setModal(false)
      setConfirmModal({ tipo: 'editar', renda: editing, payload: form })
      return
    }
    await doSave(form, false)
  }

  const doSave = async (payload, atualizarTodas) => {
    setSaving(true); setError('')
    try {
      if (editing) {
        await api.put(`/rendas/${editing.Id_Renda}`, { ...payload, atualizarTodas })
      } else {
        await api.post('/rendas', { ...payload, Id_Usuario: user.Id_Usuario })
      }
      setModal(false); setConfirmModal(null); fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar')
      setModal(true)
    }
    setSaving(false)
  }

  const filtered = rendas.filter(r => !searchTerm || r.Descricao_Renda?.toLowerCase().includes(searchTerm.toLowerCase()))
  const total = filtered.reduce((s, r) => s + Number(r.Valor_Renda), 0)

  if (!user) return null
  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div></Layout>

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Rendas</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Gerencie suas fontes de receita</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <MonthSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
            <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nova Renda</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 36, margin: 0 }} placeholder="Buscar rendas..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Total */}
        <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>{filtered.length} renda{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '1.1rem' }}>{formatCurrency(total)}</span>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.Id_Renda}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{r.Descricao_Renda}</span>
                        {r.Fixa && (
                          <span style={{
                            fontSize: '.68rem', padding: '2px 7px', borderRadius: 5,
                            background: 'rgba(16,185,129,.12)', color: 'var(--color-primary)',
                            fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3,
                          }}>
                            <Repeat size={10} /> Fixa
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(r.Data)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(r.Valor_Renda)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="btn-icon" onClick={() => openEdit(r)} title="Editar"><Pencil size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={TrendingUp} title="Sem rendas" description="Nenhuma renda registrada neste mês"
            action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Adicionar Renda</button>} />
        )}

        {/* Modal criar/editar */}
        {modal && (
          <Modal title={editing ? 'Editar Renda' : 'Nova Renda'} onClose={() => setModal(false)}>
            <form onSubmit={handleSave}>
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', fontSize: '.85rem' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Descrição</label>
                <input className="input-field" required value={form.Descricao_Renda}
                  onChange={e => setForm({ ...form, Descricao_Renda: e.target.value })}
                  placeholder="Ex: Salário, Freelance..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="input-label">Valor (R$)</label>
                  <input className="input-field" type="number" step="0.01" min="0.01" required
                    value={form.Valor_Renda} onChange={e => setForm({ ...form, Valor_Renda: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">{form.Fixa && !editing ? 'A partir de (mês/ano)' : 'Data'}</label>
                  <input className="input-field" type="date" required value={form.Data}
                    onChange={e => setForm({ ...form, Data: e.target.value })} />
                </div>
              </div>

              {!editing && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${form.Fixa ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.Fixa ? 'rgba(16,185,129,.06)' : 'var(--color-surface)',
                    transition: 'all .2s',
                  }}>
                    <input
                      type="checkbox"
                      checked={form.Fixa}
                      onChange={e => setForm({
                        ...form,
                        Fixa: e.target.checked,
                        Dia_Vencimento: e.target.checked && form.Data
                          ? parseInt(form.Data.split('-')[2])
                          : '',
                      })}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.875rem', color: form.Fixa ? 'var(--color-primary)' : 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Repeat size={14} /> Renda Fixa (recorrente)
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        Cria automaticamente nos próximos 12 meses
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {form.Fixa && !editing && (
                <div style={{ marginBottom: 14 }}>
                  <label className="input-label">Dia do mês para receber</label>
                  <input
                    className="input-field"
                    type="number" min="1" max="31" required
                    value={form.Dia_Vencimento}
                    onChange={e => setForm({ ...form, Dia_Vencimento: e.target.value })}
                    placeholder="Ex: 5 (dia 5 de cada mês)"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : form.Fixa ? 'Criar Renda Fixa' : 'Criar Renda'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: confirmar edição de renda fixa */}
        {confirmModal?.tipo === 'editar' && (
          <Modal title="Editar renda recorrente" onClose={() => { setConfirmModal(null); setModal(true) }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '.9rem', marginBottom: 24 }}>
              Esta é uma renda fixa. Deseja atualizar apenas este mês ou todos os meses futuros?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => { setConfirmModal(null); setModal(true) }}>
                Cancelar
              </button>
              <button className="btn-secondary" disabled={saving} onClick={() => doSave(confirmModal.payload, false)}>
                {saving ? 'Salvando...' : 'Só este mês'}
              </button>
              <button className="btn-primary" disabled={saving} onClick={() => doSave(confirmModal.payload, true)}>
                {saving ? 'Salvando...' : 'Todos os meses futuros'}
              </button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
