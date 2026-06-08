import { NextResponse } from 'next/server'
import { verificarToken } from '@/middlewares/auth'

async function handleRequest(request, handler, { auth = true, adminOnly = false } = {}) {
  try {
    if (auth || adminOnly) {
      const authResult = verificarToken(request)
      if (!authResult.success) {
        return NextResponse.json(
          { success: false, error: authResult.error },
          { status: authResult.status }
        )
      }
      request.usuarioId = authResult.usuarioId
      request.usuarioEmail = authResult.usuarioEmail
      request.usuarioCargo = authResult.usuarioCargo

      if (adminOnly && authResult.usuarioCargo !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Acesso restrito a administradores' },
          { status: 403 }
        )
      }
    }

    const result = await handler(request)

    if (result.isCSV) {
      return new Response(result.data, {
        status: result.status,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=relatorio.csv'
        }
      })
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: result.status }
    )
  } catch (error) {
    console.error('API Error:', error.message)
    const status = error.status || error.statusCode || 500
    const body = { success: false, error: error.message || 'Erro interno do servidor' }
    if (error.requiresVerification) {
      body.requiresVerification = true
      body.email = error.email
    }
    return NextResponse.json(body, { status })
  }
}

export { handleRequest }
