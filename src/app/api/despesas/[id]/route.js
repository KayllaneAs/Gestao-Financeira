import { handleRequest } from '@/app/api/_helpers/routeHandler'
import despesaController from '@/controllers/despesaController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return despesaController.buscarPorId(id)
  })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return despesaController.atualizar(id, body)
  })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const deletarParcelamento = searchParams.get('deletarParcelamento') === 'true'
    return despesaController.deletar(id, deletarParcelamento)
  })
}
