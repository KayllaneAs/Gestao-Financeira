'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { Button } from '@/components/Button'
import { Input, Label, InputError } from '@/components/Input'
import { Card } from '@/components/Card'
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, senha)
      router.push('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresVerification) {
        router.push(`/verificar-email?email=${encodeURIComponent(data.email || email)}`)
        return
      }
      setError(data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden' }}>
        <div>
          <section className="p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className={cn(
                "w-14 h-14 rounded-2xl mx-auto mb-4",
                "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]",
                "flex items-center justify-center",
                "shadow-xl shadow-[var(--color-primary)]/30",
                "hover-scale"
              )}>
                <Wallet size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold mb-1 text-[var(--color-text)]">
                Entrar no FinanceApp
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Acesse sua conta para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className={cn(
                  "p-3 rounded-xl",
                  "bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30",
                  "text-[var(--color-danger)] text-sm",
                  "fade-in"
                )}>
                  {error}
                </div>
              )}

              <div>
                <Label>E-mail</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Senha</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
                {!loading && <ArrowRight size={18} />}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <Link 
                href="/esqueci-senha" 
                className="block text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                Esqueci minha senha
              </Link>
              
              <p className="text-[var(--color-text-muted)]">
                Não tem conta?{' '}
                <Link 
                  href="/register" 
                  className="text-[var(--color-primary)] font-bold hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}