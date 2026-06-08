'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Wallet, Mail, Lock, User, ArrowRight, Eye, EyeOff, Rocket } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const resultado = await register(nome, email, senha)
      if (resultado?.requiresVerification) {
        router.push(`/verificar-email?email=${encodeURIComponent(resultado.email)}`)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 980, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr' }} className="auth-grid">
          <section style={{
            padding: '44px clamp(20px, 3.5vw, 46px)',
            background: 'linear-gradient(155deg, color-mix(in srgb, var(--color-primary) 17%, transparent), color-mix(in srgb, var(--color-accent) 12%, transparent))',
            borderRight: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 18 }}>
              Ambiente profissional de gestão financeira
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
              Crie sua conta e eleve o nível do seu controle financeiro.
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 26 }}>
              Planeje metas, acompanhe parcelamentos e tenha clareza total dos seus números com um dashboard completo.
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                'Onboarding rápido e intuitivo',
                'Relatórios inteligentes com insights',
                'Experiência moderna para uso diário',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-secondary)', fontSize: '.9rem' }}>
                  <Rocket size={16} style={{ color: 'var(--color-primary)' }} />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '42px clamp(20px, 3vw, 38px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                boxShadow: '0 10px 28px rgba(79,70,229,.28)',
              }}>
                <Wallet size={28} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: 4 }}>Criar conta</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>Comece a organizar suas finanças agora.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 18,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--color-danger)', fontSize: '.85rem',
                }}>{error}</div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Nome completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: 42 }} type="text" placeholder="João Silva" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: 42 }} type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label className="input-label">Senha</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input-field"
                    style={{ paddingLeft: 42, paddingRight: 42 }}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 22px', fontSize: '.95rem' }}>
                {loading ? 'Criando...' : 'Criar conta'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 14, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>
                Fazer login
              </Link>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
          }

          .auth-grid section:first-child {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}