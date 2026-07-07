'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import MonthSelector from '@/components/MonthSelector'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate, CATEGORIAS } from '@/utils/helpers'
import {
  Plus, Pencil, Trash2, Receipt, Search, Download, X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const emptyForm = {
  Id_Conta: '', Descricao_Despesa: '', Valor_Total: '', Valor_Parcela: '',
  Data: '', Categoria: '', Numero_Parcelas: 1,
}

export default function Despesas() {
  const { user } = useAuth()
  const router = useRouter()
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [despesas, setDespesas] = useState([])
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [dResp, cResp] = await Promise.all([
        api.get(`/despesas/usuario/${user.Id_Usuario}`, { params: { mes, ano } }),
        api.get(`/contas-cartoes/usuario/${user.Id_Usuario}`),
      ])
      setDespesas(dResp.data.data)
      setContas(cResp.data.data)
    } catch { }
    setLoading(false)
  }, [user, mes, ano])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setForm({ ...emptyForm, Data: `${ano}-${String(mes).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` })
    setEditing(null); setError(''); setModal(true)
  }
  const openEdit = (d) => {
    setForm({
      Id_Conta: d.Id_Conta, Descricao_Despesa: d.Descricao_Despesa,
      Valor_Total: d.Valor_Parcela, Valor_Parcela: d.Valor_Parcela,
      Data: d.Data, Categoria: d.Categoria, Numero_Parcelas: 1,
    })
    setEditing(d); setError(''); setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const numParcelas = parseInt(form.Numero_Parcelas) || 1
      const valorTotal = parseFloat(form.Valor_Total) || 0
      const body = {
        Id_Usuario: user.Id_Usuario, Id_Conta: form.Id_Conta,
        Descricao_Despesa: form.Descricao_Despesa,
        Valor_Total: valorTotal,
        Valor_Parcela: numParcelas > 1 ? +(valorTotal / numParcelas).toFixed(2) : valorTotal,
        Data: form.Data, Categoria: form.Categoria,
        Numero_Parcelas: numParcelas,
      }
      if (editing) {
        await api.put(`/despesas/${editing.Id_Despesa}`, {
          Descricao_Despesa: form.Descricao_Despesa,
          Valor_Parcela: valorTotal,
          Data: form.Data, Categoria: form.Categoria,
          Id_Conta: form.Id_Conta,
        })
      } else {
        await api.post('/despesas', body)
      }
      setModal(false); fetchData()
    } catch (err) { setError(err.response?.data?.error || 'Erro ao salvar') }
    setSaving(false)
  }

  const handleDelete = async (d) => {
    if (!confirm(`Deletar "${d.Descricao_Despesa}"?`)) return
    const deletarParcelamento = d.Id_Parcelamento ? true : false
    try {
      await api.delete(`/despesas/${d.Id_Despesa}?deletarParcelamento=${deletarParcelamento}`)
      fetchData()
    } catch { }
  }

  const exportCSV = async () => {
    try {
      const { data } = await api.get(`/despesas/usuario/${user.Id_Usuario}/exportar-csv`, {
        params: { mes, ano }, responseType: 'blob',
      })
      const url = URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a'); a.href = url
      a.download = `despesas-${mes}-${ano}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch { }
  }

  const filtered = despesas.filter(d => {
    const matchSearch = !searchTerm || d.Descricao_Despesa?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = !filterCat || d.Categoria === filterCat
    return matchSearch && matchCat
  })

  const total = filtered.reduce((s, d) => s + Number(d.Valor_Parcela), 0)

  if (!user) return null
  if (loading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><LoadingSpinner /></div></Layout>

  return (
    <Layout>
      <div style={{ animation: 'fadeIn .4s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Despesas</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>Gerencie seus gastos mensais</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <MonthSelector mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
            <button className="btn-secondary" onClick={exportCSV}><Download size={16} /> CSV</button>
            <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nova Despesa</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" style={{ paddingLeft: 36, margin: 0 }} placeholder="Buscar despesas..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="input-field" style={{ margin: 0, minWidth: 160, maxWidth: 200, cursor: 'pointer' }}
            value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todas categorias</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(searchTerm || filterCat) && (
            <button className="btn-icon" onClick={() => { setSearchTerm(''); setFilterCat('') }} title="Limpar filtros">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Total */}
        <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>
            {filtered.length} despesa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '1.1rem' }}>{formatCurrency(total)}</span>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Conta</th>
                  <th>Data</th>
                  <th>Parcela</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.Id_Despesa}>
                    <td style={{ fontWeight: 600 }}>{d.Descricao_Despesa}</td>
                    <td><span className="badge badge-default">{d.Categoria}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {d.conta?.Cor_Hex && <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.conta.Cor_Hex, flexShrink: 0 }} />}
                        {d.conta?.Nome_Conta || '—'}
                      </div>
                    </td>
                    <td>{formatDate(d.Data)}</td>
                    <td>
                      {d.parcelamento ? (
                        <span className="badge badge-info">{d.Numero_Parcela}/{d.parcelamento.Qtd_Parcelas}</span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-danger)' }}>
                      {formatCurrency(d.Valor_Parcela)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="btn-icon" onClick={() => openEdit(d)} title="Editar"><Pencil size={15} /></button>
                        <button className="btn-icon" onClick={() => handleDelete(d)} title="Deletar"
                          style={{ color: 'var(--color-danger)' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={Receipt} title="Sem despesas" description="Nenhuma despesa neste mês"
          action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Adicionar Despesa</button>} />}

        {/* Modal */}
        {modal && (
          <Modal title={editing ? 'Editar Despesa' : 'Nova Despesa'} onClose={() => setModal(false)}>
            <form onSubmit={handleSave}>
              {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', fontSize: '.85rem' }}>{error}</div>}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Descrição</label>
                <input className="input-field" required value={form.Descricao_Despesa}
                  onChange={e => setForm({ ...form, Descricao_Despesa: e.target.value })} placeholder="Ex: Mercado, Uber, Netflix..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="input-label">Valor Total (R$)</label>
                  <input className="input-field" type="number" step="0.01" min="0.01" required
                    value={form.Valor_Total} onChange={e => setForm({ ...form, Valor_Total: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Nº Parcelas</label>
                  <input className="input-field" type="number" min="1" max="48"
                    value={form.Numero_Parcelas} onChange={e => setForm({ ...form, Numero_Parcelas: e.target.value })}
                    disabled={!!editing} />
                </div>
              </div>

              {parseInt(form.Numero_Parcelas) > 1 && (
                <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--color-primary-light)', fontSize: '.85rem' }}>
                  {form.Numero_Parcelas}x de {formatCurrency((parseFloat(form.Valor_Total) || 0) / (parseInt(form.Numero_Parcelas) || 1))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="input-label">Data</label>
                  <input className="input-field" type="date" required value={form.Data}
                    onChange={e => setForm({ ...form, Data: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Categoria</label>
                  <select className="input-field" required value={form.Categoria}
                    onChange={e => setForm({ ...form, Categoria: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="">Selecione</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="input-label">Conta / Cartão</label>
                <select className="input-field" required value={form.Id_Conta}
                  onChange={e => setForm({ ...form, Id_Conta: e.target.value })} style={{ cursor: 'pointer' }}>
                  <option value="">Selecione</option>
                  {contas.map(c => (
                    <option key={c.Id_Conta} value={c.Id_Conta}>
                      {c.Nome_Conta} ({c.Tipo}{c.Ultimos_Digitos ? ` •••${c.Ultimos_Digitos}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar Despesa'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
