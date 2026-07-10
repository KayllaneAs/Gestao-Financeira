import { handleRequest } from '@/app/api/_helpers/routeHandler'
import parcelamentoAgrupadorController from '@/controllers/parcelamentoAgrupadorController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return parcelamentoAgrupadorController.buscarPorId(id)
  })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return parcelamentoAgrupadorController.atualizar(id, body)
  })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return parcelamentoAgrupadorController.deletar(id)
  })
}
