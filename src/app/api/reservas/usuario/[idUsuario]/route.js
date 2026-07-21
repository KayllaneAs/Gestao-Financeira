import { handleRequest } from '@/app/api/_helpers/routeHandler'
import reservaController from '@/controllers/reservaController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { idUsuario } = await params
    return reservaController.listarPorUsuario(idUsuario)
  })
}
