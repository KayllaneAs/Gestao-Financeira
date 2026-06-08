import jwt from 'jsonwebtoken'
import env from '@/config/env'

function verificarToken(request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return { success: false, error: 'Token não fornecido', status: 401 }
    }

    const parts = authHeader.split(' ')

    if (parts.length !== 2) {
      return { success: false, error: 'Token mal formatado', status: 401 }
    }

    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme)) {
      return { success: false, error: 'Token mal formatado', status: 401 }
    }

    const decoded = jwt.verify(token, env.jwt.secret)

    return {
      success: true,
      usuarioId: decoded.id,
      usuarioEmail: decoded.email,
      usuarioCargo: decoded.cargo || 'usuario'
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expirado', status: 401 }
    }
    return { success: false, error: 'Token inválido', status: 401 }
  }
}

export { verificarToken }
