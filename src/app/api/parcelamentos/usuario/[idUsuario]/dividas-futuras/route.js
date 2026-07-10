import { handleRequest } from '@/app/api/_helpers/routeHandler'
import parcelamentoAgrupadorController from '@/controllers/parcelamentoAgrupadorController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { idUsuario } = await params
    return parcelamentoAgrupadorController.dividasFuturas(idUsuario)
  })
}
