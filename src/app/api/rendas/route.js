import { handleRequest } from '@/app/api/_helpers/routeHandler'
import rendaController from '@/controllers/rendaController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    body.Id_Usuario = req.usuarioId
    return rendaController.criar(body)
  }, { auth: true })
}
