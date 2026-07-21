import { handleRequest } from '@/app/api/_helpers/routeHandler'
import reservaController from '@/controllers/reservaController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return reservaController.buscarPorId(id)
  })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return reservaController.atualizar(id, body)
  })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return reservaController.deletar(id)
  })
}
