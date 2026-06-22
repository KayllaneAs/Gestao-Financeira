import { handleRequest } from '@/app/api/_helpers/routeHandler'
import contaCartaoController from '@/controllers/contaCartaoController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return contaCartaoController.buscarPorId(id)
  })
}

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return contaCartaoController.atualizar(id, body)
  })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return contaCartaoController.deletar(id)
  })
}
