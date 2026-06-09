'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'
import { Lock, ArrowRight, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function ResetarSenha() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [digitos, setDigitos] = useState(['', '', '', '', '', ''])
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reenvioLoading, setReenvioLoading] = useState(false)
  const [reenvioMsg, setReenvioMsg] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const refs = useRef([])

  useEffect(() => {
    if (!email) router.push('/esqueci-senha')
  }, [email, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleDigito = (index, valor) => {
    if (!/^\d?$/.test(valor)) return
    const novos = [...digitos]
    novos[index] = valor
    setDigitos(novos)
    if (valor && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setDigitos(paste.split(''))
      refs.current[5]?.focus()
    }
  }

  const codigo = digitos.join('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (codigo.length < 6) { setError('Digite o código completo de 6 dígitos'); return }
    if (novaSenha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return }
    if (novaSenha !== confirmarSenha) { setError('As senhas não coincidem'); return }

    setLoading(true)
    try {
      await api.post('/usuarios/resetar-senha', { email, codigo, novaSenha })
      router.push('/login?resetado=1')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  const handleReenviar = async () => {
    if (cooldown > 0) return
    setReenvioLoading(true)
    setReenvioMsg('')
    setError('')
    try {
      await api.post('/usuarios/esqueci-senha', { email })
      setReenvioMsg('Novo código enviado!')
      setCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao reenviar')
    } finally {
      setReenvioLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 620, padding: '34px clamp(18px, 3vw, 34px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 10px 26px rgba(79,70,229,.28)',
          }}>
            <KeyRound size={25} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 5 }}>Definir nova senha</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem', lineHeight: 1.5 }}>
            Código enviado para <strong style={{ color: 'var(--color-text-secondary)' }}>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--color-danger)', fontSize: '.85rem',
            }}>{error}</div>
          )}

          {reenvioMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: 'var(--color-primary)', fontSize: '.85rem',
            }}>{reenvioMsg}</div>
          )}

          <label className="input-label" style={{ display: 'block', marginBottom: 12 }}>
            Código de verificação
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 22 }} onPaste={handlePaste}>
            {digitos.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigito(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48,
                  height: 54,
                  textAlign: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  background: 'var(--color-surface-3)',
                  border: `2px solid ${d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 12,
                  color: 'var(--color-text)',
                  outline: 'none',
                  transition: 'border-color .15s',
                  caretColor: 'var(--color-primary)',
                }}
              />
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="input-label">Nova senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 42, paddingRight: 42 }}
                type={showPwd ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label className="input-label">Confirmar nova senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 42, paddingRight: 42 }}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
              }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 22px', fontSize: '.95rem' }}>
            {loading ? 'Salvando...' : 'Redefinir senha'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={handleReenviar}
            disabled={reenvioLoading || cooldown > 0}
            style={{
              background: 'none', border: 'none', cursor: cooldown > 0 ? 'default' : 'pointer',
              color: cooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
              fontSize: '.85rem', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <RefreshCw size={14} />
            {reenvioLoading ? 'Enviando...' : cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
          <Link href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            ← Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}