'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import Layout from '@/components/Layout'
import { formatCurrency, CATEGORIAS } from '@/utils/helpers'
import {
  Upload, FileText, CheckCircle, ChevronRight, ChevronLeft,
  AlertCircle, Repeat, ShoppingCart, RefreshCw, X, Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// ── Constantes de estilos ──────────────────────────────────────────────────────
const S = {
  card: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    fontSize: '.8125rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    padding: '11px 24px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btnSecondary: {
    padding: '11px 24px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
    fontSize: '.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: (color) => ({
    fontSize: '.7rem',
    padding: '2px 8px',
    borderRadius: 6,
    background: `${color}22`,
    color: color,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  }),
}

// ── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Upload', 'Mapeamento', 'Revisão', 'Confirmar']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '.8125rem', fontWeight: 700, flexShrink: 0,
                background: done ? 'var(--color-primary)' : active ? 'var(--color-primary)' : 'var(--color-surface-3)',
                color: done || active ? '#fff' : 'var(--color-text-muted)',
                border: active ? '2px solid var(--color-primary)' : 'none',
              }}>
                {done ? <CheckCircle size={16} /> : num}
              </div>
              <span style={{
                fontSize: '.8125rem', fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-text)' : done ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)', margin: '0 12px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Passo 1: Upload ────────────────────────────────────────────────────────────
function Step1Upload({ onNext }) {
  const [dragging, setDragging] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Selecione um arquivo .csv')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setCsvText(e.target.result)
    reader.readAsText(file, 'utf-8')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handlePreview = async () => {
    if (!csvText) { setError('Selecione um arquivo CSV'); return }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/importar-csv', { csv: csvText })
      onNext({ csvText, fileName, preview: data.data })
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao ler CSV')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Selecione o arquivo CSV</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginBottom: 24 }}>
        Suporta extratos de cartão de crédito e conta corrente nos formatos CSV com separador <code>;</code> ou <code>,</code>.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 16,
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(16,185,129,.05)' : 'var(--color-surface)',
          transition: 'all .2s',
          marginBottom: 16,
        }}
      >
        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        <Upload size={40} color="var(--color-text-muted)" style={{ marginBottom: 12 }} />
        {fileName ? (
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '.9375rem' }}>{fileName}</p>
            <p style={{ color: 'var(--color-primary)', fontSize: '.8125rem', marginTop: 4 }}>Clique para trocar</p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '.9375rem' }}>Arraste o CSV ou clique para selecionar</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.8125rem', marginTop: 4 }}>Apenas arquivos .csv</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '.875rem', marginBottom: 16 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handlePreview} disabled={!csvText || loading} style={{ ...S.btnPrimary, opacity: !csvText || loading ? 0.6 : 1 }}>
          {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Passo 2: Mapeamento de colunas ────────────────────────────────────────────
function Step2Mapeamento({ data, onNext, onBack }) {
  const { csvText, preview } = data
  const [colData, setColData] = useState(preview.sugestao.colData)
  const [colDesc, setColDesc] = useState(preview.sugestao.colDesc)
  const [colValor, setColValor] = useState(preview.sugestao.colValor)
  const [ignorarNegativo, setIgnorarNegativo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleProcessar = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: res } = await api.post('/importar-csv/processar', {
        csv: csvText,
        colData,
        colDesc,
        colValor,
        ignorarNegativo,
      })
      onNext({ ...data, resultado: res.data })
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar CSV')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Mapeamento de colunas</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginBottom: 20 }}>
        Arquivo com <strong>{preview.totalLinhas}</strong> linhas. Separador detectado: <code>{preview.separador}</code>
      </p>

      {/* Amostra */}
      <div style={{ ...S.card, marginBottom: 24, overflowX: 'auto' }}>
        <p style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Amostra das primeiras linhas:
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8125rem' }}>
          <thead>
            <tr>
              {preview.cabecalho.map((h, i) => (
                <th key={i} style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                  Col {i}: {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.amostra.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '6px 12px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seletores de coluna */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Coluna de Data', value: colData, set: setColData },
          { label: 'Coluna de Descrição', value: colDesc, set: setColDesc },
          { label: 'Coluna de Valor', value: colValor, set: setColValor },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label style={S.label}>{label}</label>
            <select value={value} onChange={(e) => set(Number(e.target.value))} style={S.select}>
              {preview.cabecalho.map((h, i) => (
                <option key={i} value={i}>Col {i}: {h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 24, fontSize: '.875rem', color: 'var(--color-text-secondary)' }}>
        <input type="checkbox" checked={ignorarNegativo} onChange={(e) => setIgnorarNegativo(e.target.checked)} />
        Ignorar valores negativos (pagamentos recebidos/estornos)
      </label>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '.875rem', marginBottom: 16 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={S.btnSecondary}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <button onClick={handleProcessar} disabled={loading} style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          Processar <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Passo 3: Revisão ───────────────────────────────────────────────────────────
function Step3Revisao({ data, onNext, onBack }) {
  const { resultado } = data
  const [transacoes, setTransacoes] = useState(resultado.transacoes)
  const [grupos, setGrupos] = useState(resultado.grupos)

  const setCatTransacao = (id, cat) => {
    setTransacoes(prev => prev.map(t => t.id === id ? { ...t, categoria: cat } : t))
  }

  const setCatGrupo = (chave, cat) => {
    setGrupos(prev => prev.map(g => g.chave === chave ? { ...g, categoria: cat } : g))
    // Atualiza também nas transações parceladas correspondentes
    setTransacoes(prev => prev.map(t =>
      t.ehParcelamento && t.parcela && t.descricaoBase.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim() === chave
        ? { ...t, categoria: cat }
        : t
    ))
  }

  const removerTransacao = (id) => {
    setTransacoes(prev => prev.filter(t => t.id !== id))
  }

  const avulsas = transacoes.filter(t => !t.ehParcelamento)

  return (
    <div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Revisão das transações</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginBottom: 20 }}>
        Revise e ajuste as categorias antes de confirmar.
      </p>

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total de transações', value: transacoes.length, color: 'var(--color-primary)' },
          { label: 'Parcelamentos', value: grupos.length, color: '#8b5cf6' },
          { label: 'Avulsas', value: avulsas.length, color: '#f97316' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Grupos de parcelamento */}
      {grupos.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '.9375rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Repeat size={18} color="#8b5cf6" /> Parcelamentos detectados
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {grupos.map(g => (
              <div key={g.chave} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '.875rem' }}>{g.descricao}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {g.totalParcelas}x de {formatCurrency(g.valorParcela)} = {formatCurrency(g.valorTotal)} · Início: {g.dataInicio}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ ...S.badge('#8b5cf6'), padding: '3px 10px', fontSize: '.75rem' }}>
                    Cria {g.totalParcelas} meses
                  </div>
                  <select
                    value={g.categoria}
                    onChange={(e) => setCatGrupo(g.chave, e.target.value)}
                    style={{ ...S.select, width: 160 }}
                  >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Despesas avulsas */}
      {avulsas.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '.9375rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} color="#f97316" /> Despesas avulsas
          </h3>
          <div style={{ ...S.card, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-3)' }}>
                  {['Data', 'Descrição', 'Valor', 'Categoria', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {avulsas.map(t => (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)' }}>{t.data}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descricao}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text)', fontWeight: 600 }}>{formatCurrency(t.valor)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <select value={t.categoria} onChange={(e) => setCatTransacao(t.id, e.target.value)} style={{ ...S.select, padding: '6px 10px' }}>
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => removerTransacao(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultado.erros?.length > 0 && (
        <div style={{ ...S.card, background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>
            <AlertCircle size={16} /> {resultado.erros.length} linha(s) ignoradas
          </div>
          {resultado.erros.slice(0, 5).map((e, i) => (
            <div key={i} style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>Linha {e.linha}: {e.motivo}</div>
          ))}
        </div>
      )}

      {/* Total geral */}
      {transacoes.length > 0 && (
        <div style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: 'rgba(16,185,129,.04)', border: '1px solid rgba(16,185,129,.2)' }}>
          <span style={{ fontSize: '.875rem', color: 'var(--color-text-secondary)' }}>
            Total desta fatura ({transacoes.length} itens)
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {formatCurrency(transacoes.reduce((s, t) => s + t.valor, 0))}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={S.btnSecondary}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <button
          onClick={() => onNext({ ...data, transacoesEditadas: transacoes, gruposEditados: grupos })}
          disabled={transacoes.length === 0 && grupos.length === 0}
          style={{ ...S.btnPrimary, opacity: (transacoes.length === 0 && grupos.length === 0) ? 0.6 : 1 }}
        >
          Confirmar <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Passo 4: Confirmar ────────────────────────────────────────────────────────
function Step4Confirmar({ data, onBack, contas, onSuccess }) {
  const [idConta, setIdConta] = useState(contas[0]?.Id_Conta || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { transacoesEditadas, gruposEditados } = data

  const avulsas = transacoesEditadas.filter(t => !t.ehParcelamento)
  const totalParcelasASerem = gruposEditados.reduce((s, g) => s + g.totalParcelas, 0)

  const handleConfirmar = async () => {
    if (!idConta) { setError('Selecione uma conta'); return }
    setLoading(true)
    setError('')
    try {
      const { data: res } = await api.post('/importar-csv/confirmar', {
        idConta,
        transacoes: avulsas,
        grupos: gruposEditados,
      })
      onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao importar')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Confirmar importação</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginBottom: 24 }}>
        Selecione a conta/cartão e confirme. Você poderá desfazer após importar se necessário.
      </p>

      <div style={{ marginBottom: 20, maxWidth: 380 }}>
        <label style={S.label}>Conta / Cartão</label>
        <select value={idConta} onChange={(e) => setIdConta(e.target.value)} style={S.select}>
          <option value="">Selecione...</option>
          {contas.map(c => (
            <option key={c.Id_Conta} value={c.Id_Conta}>{c.Nome_Conta} ({c.Tipo})</option>
          ))}
        </select>
      </div>

      {/* Resumo do que será criado */}
      <div style={{ ...S.card, background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.2)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 12 }}>
          <Info size={16} /> O que será criado:
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: '.875rem', color: 'var(--color-text-secondary)', lineHeight: 2 }}>
          {gruposEditados.length > 0 && (
            <li><strong>{gruposEditados.length}</strong> parcelamento(s) com <strong>{totalParcelasASerem}</strong> despesas (todos os meses, passado e futuro)</li>
          )}
          {avulsas.length > 0 && (
            <li><strong>{avulsas.length}</strong> despesa(s) avulsa(s)</li>
          )}
        </ul>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '.875rem', marginBottom: 16 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={S.btnSecondary} disabled={loading}>
          <ChevronLeft size={16} /> Voltar
        </button>
        <button onClick={handleConfirmar} disabled={loading || !idConta} style={{ ...S.btnPrimary, opacity: loading || !idConta ? 0.6 : 1 }}>
          {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          Importar agora
        </button>
      </div>
    </div>
  )
}

// ── Tela de Sucesso ────────────────────────────────────────────────────────────
function Sucesso({ resultado, onReset, router }) {
  const [desfazendo, setDesfazendo] = useState(false)
  const [desfeito, setDesfeito] = useState(false)
  const [errDesfazer, setErrDesfazer] = useState('')

  const handleDesfazer = async () => {
    if (!confirm('Tem certeza? Isso irá remover todos os parcelamentos e despesas criados nesta importação.')) return
    setDesfazendo(true)
    setErrDesfazer('')
    try {
      await api.post('/importar-csv/desfazer', {
        idsParcelamentos: resultado.idsParcelamentos,
        idsDespesasAvulsas: resultado.idsDespesasAvulsas,
      })
      setDesfeito(true)
    } catch (err) {
      setErrDesfazer(err.response?.data?.error || 'Erro ao desfazer')
    }
    setDesfazendo(false)
  }

  if (desfeito) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <X size={64} color="#ef4444" style={{ marginBottom: 20 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Importação desfeita</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.9375rem', marginBottom: 32 }}>
          Todos os dados criados pela importação foram removidos.
        </p>
        <button onClick={onReset} style={S.btnPrimary}>Importar novamente</button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <CheckCircle size={64} color="var(--color-primary)" style={{ marginBottom: 20 }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Importação concluída!</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.9375rem', marginBottom: 32 }}>
        Seus dados foram importados com sucesso.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: 'Parcelamentos criados', value: resultado.parcelamentosCriados, color: '#8b5cf6' },
          { label: 'Total de despesas', value: resultado.despesasCriadas, color: 'var(--color-primary)' },
          { label: 'Avulsas', value: resultado.despesasAvulsas, color: '#f97316' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...S.card, minWidth: 140, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {errDesfazer && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#ef4444', fontSize: '.875rem', marginTop: 16 }}>
          <AlertCircle size={16} /> {errDesfazer}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
        <button onClick={handleDesfazer} disabled={desfazendo} style={{
          ...S.btnSecondary,
          color: '#ef4444',
          borderColor: '#ef4444',
          opacity: desfazendo ? 0.6 : 1,
        }}>
          {desfazendo ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={16} />}
          {desfazendo ? 'Desfazendo...' : 'Desfazer importação'}
        </button>
        <button onClick={onReset} style={S.btnSecondary}>
          Importar outro arquivo
        </button>
        <button onClick={() => router.push('/despesas')} style={S.btnPrimary}>
          Ver despesas
        </button>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function ImportarCSV() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [wizardData, setWizardData] = useState({})
  const [contas, setContas] = useState([])
  const [resultado, setResultado] = useState(null)

  useEffect(() => { if (!user) router.push('/login') }, [user, router])

  const fetchContas = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await api.get(`/contas-cartoes/usuario/${user.Id_Usuario}`)
      setContas(data.data)
    } catch { }
  }, [user])

  useEffect(() => { fetchContas() }, [fetchContas])

  const handleReset = () => {
    setStep(1)
    setWizardData({})
    setResultado(null)
  }

  return (
    <Layout>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Importar CSV</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', margin: 0 }}>
              Importe despesas do extrato do seu cartão ou conta bancária
            </p>
          </div>
        </div>

        <div style={S.card}>
          {resultado ? (
            <Sucesso resultado={resultado} onReset={handleReset} router={router} />
          ) : (
            <>
              <StepIndicator step={step} />

              {step === 1 && (
                <Step1Upload
                  onNext={(d) => { setWizardData(d); setStep(2) }}
                />
              )}

              {step === 2 && (
                <Step2Mapeamento
                  data={wizardData}
                  onNext={(d) => { setWizardData(d); setStep(3) }}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <Step3Revisao
                  data={wizardData}
                  onNext={(d) => { setWizardData(d); setStep(4) }}
                  onBack={() => setStep(2)}
                />
              )}

              {step === 4 && (
                <Step4Confirmar
                  data={wizardData}
                  contas={contas}
                  onBack={() => setStep(3)}
                  onSuccess={(r) => setResultado(r)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
