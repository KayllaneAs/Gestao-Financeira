'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, senha) => {
    const res = await api.post('/usuarios/login', { Email: email, Senha: senha })
    const { token, usuario } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(usuario))
    setUser(usuario)
    return usuario
  }

  const register = async (nome, email, senha) => {
    const res = await api.post('/usuarios/registrar', { Nome: nome, Email: email, Senha: senha })
    // Retorna { requiresVerification: true, email } — login ocorre na página /verificar-email
    return res.data.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #334155',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
