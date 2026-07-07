import { handleRequest } from '@/app/api/_helpers/routeHandler'
import parcelamentoAgrupadorController from '@/controllers/parcelamentoAgrupadorController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return parcelamentoAgrupadorController.criar(body)
  })
}
