import { handleRequest } from '@/app/api/_helpers/routeHandler'
import usuarioController from '@/controllers/usuarioController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return usuarioController.resetarSenha(body)
  }, { auth: false })
}
