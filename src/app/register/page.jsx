'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Wallet, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

import PasswordStrength from '@/components/PasswordStrength'
import { validarSenha } from '@/utils/passwordValidator'

export default function Register() {
  const { register } = useAuth()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // validação em tempo real
  const validacaoSenha = validarSenha(senha)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validacaoSenha.valida) {
      setError(
        'A senha deve possuir no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.'
      )
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
      <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden' }}>
        <section style={{ padding: '42px clamp(20px, 3vw, 38px)' }}>

          {/* HEADER */}
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

            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: 4 }}>
              Criar conta
            </h2>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
              Comece a organizar suas finanças agora.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                marginBottom: 18,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--color-danger)',
                fontSize: '.85rem',
              }}>
                {error}
              </div>
            )}

            {/* NOME */}
            <div style={{ marginBottom: 14 }}>
              <label className="input-label">Nome completo</label>

              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />

                <input
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  type="text"
                  placeholder="João Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: 14 }}>
              <label className="input-label">E-mail</label>

              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />

                <input
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* SENHA  */}
            <div style={{ marginBottom: 22 }}>
              <label className="input-label">Senha</label>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />

                <input
                  className="input-field"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Digite uma senha segura"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* COMPONENTE DE FORÇA */}
              <PasswordStrength senha={senha} />

              {/* ALERTA */}
              {senha && !validacaoSenha.valida && (
                <p style={{
                  marginTop: 8,
                  color: 'var(--color-text-muted)',
                  fontSize: '.82rem',
                }}>
                  A senha ainda não atende todos os requisitos.
                </p>
              )}
            </div>

            {/* BOTÃO */}
            <button
              className="btn-primary"
              type="submit"
              disabled={loading || !validacaoSenha.valida}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px 22px',
                fontSize: '.95rem',
                opacity: loading || !validacaoSenha.valida ? 0.6 : 1,
                cursor: loading || !validacaoSenha.valida ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Criando...' : 'Criar conta'}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: '.85rem',
            color: 'var(--color-text-muted)'
          }}>
            Já tem conta?{' '}
            <Link href="/login" style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 700
            }}>
              Fazer login
            </Link>
          </div>

        </section>
      </div>
    </div>
  )
}