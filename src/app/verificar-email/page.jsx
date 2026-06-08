'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/services/api'
import { ShieldCheck, ArrowRight, RefreshCw, BadgeCheck } from 'lucide-react'
import Link from 'next/link'

export default function VerificarEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [digitos, setDigitos] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reenvioLoading, setReenvioLoading] = useState(false)
  const [reenvioMsg, setReenvioMsg] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const refs = useRef([])

  useEffect(() => {
    if (!email) router.push('/register')
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
    if (codigo.length < 6) { setError('Digite o código completo de 6 dígitos'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/usuarios/verificar-email', { email, codigo })
      const { token, usuario } = res.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(usuario))
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao verificar código')
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
      await api.post('/usuarios/reenviar-codigo', { email })
      setReenvioMsg('Novo código enviado!')
      setCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao reenviar código')
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
            <ShieldCheck size={25} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 5 }}>Verificar e-mail</h1>
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

          <button className="btn-primary" type="submit" disabled={loading || codigo.length < 6} style={{ width: '100%', justifyContent: 'center', padding: '13px 22px', fontSize: '.95rem' }}>
            {loading ? 'Verificando...' : 'Confirmar e entrar'}
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

        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '.85rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <BadgeCheck size={14} />
          <Link href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}