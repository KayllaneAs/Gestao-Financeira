import { handleRequest } from '@/app/api/_helpers/routeHandler'
import contaCartaoController from '@/controllers/contaCartaoController'

export async function GET(request, { params }) {
  return handleRequest(request, async (req) => {
    const { idUsuario } = await params
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo')
    return contaCartaoController.listarPorUsuario(idUsuario, tipo)
  })
}
