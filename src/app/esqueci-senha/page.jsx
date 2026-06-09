'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import { Mail, ArrowRight, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function EsqueciSenha() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/usuarios/esqueci-senha', { email })
      router.push(`/resetar-senha?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 920, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-grid-recovery">
          <section style={{
            padding: '40px clamp(20px, 3.5vw, 42px)',
            borderRight: '1px solid var(--color-border)',
            background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 16%, transparent), color-mix(in srgb, var(--color-accent) 10%, transparent))',
          }}>
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--color-primary)', fontSize: '.75rem', fontWeight: 700, marginBottom: 16 }}>
              Recuperação segura
            </div>
            <h1 style={{ fontSize: '1.85rem', lineHeight: 1.18, fontWeight: 800, marginBottom: 12 }}>
              Vamos recuperar seu acesso com segurança.
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 22 }}>
              Enviamos um código de verificação para garantir que apenas você redefina a senha da conta.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '.9rem' }}>
              <ShieldAlert size={16} style={{ color: 'var(--color-primary)' }} />
              Processo rápido e protegido por e-mail
            </div>
          </section>

          <section style={{ padding: '40px clamp(20px, 3vw, 36px)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 6 }}>Esqueci minha senha</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem', marginBottom: 22 }}>
              Digite seu e-mail para receber o código.
            </p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--color-danger)', fontSize: '.85rem',
                }}>{error}</div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label className="input-label">E-mail da conta</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: 42 }} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 22px', fontSize: '.95rem' }}>
                {loading ? 'Enviando...' : 'Enviar código'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
              Lembrou a senha?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>
                Fazer login
              </Link>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .auth-grid-recovery {
            grid-template-columns: 1fr !important;
          }

          .auth-grid-recovery section:first-child {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}