import { handleRequest } from '@/app/api/_helpers/routeHandler'
import reservaController from '@/controllers/reservaController'

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return reservaController.retirarValor(id, body)
  })
}

