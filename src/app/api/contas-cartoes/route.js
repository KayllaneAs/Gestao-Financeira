import { handleRequest } from '@/app/api/_helpers/routeHandler'
import contaCartaoController from '@/controllers/contaCartaoController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    // Id_Usuario sempre vem do token JWT — nunca do body (segurança)
    return contaCartaoController.criar({ ...body, Id_Usuario: req.usuarioId })
  })
}
