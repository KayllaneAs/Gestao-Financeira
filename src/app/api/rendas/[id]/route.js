import { handleRequest } from '@/app/api/_helpers/routeHandler'
import rendaController from '@/controllers/rendaController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return rendaController.buscarPorId(id)
  }, { auth: true })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return rendaController.atualizar(id, body)
  }, { auth: true })
}
