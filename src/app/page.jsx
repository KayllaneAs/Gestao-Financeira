'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (user.Cargo === 'admin') {
      router.push('/admin/usuarios')
    } else {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  return null
}