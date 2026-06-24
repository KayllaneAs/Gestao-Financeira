import { handleRequest } from '@/app/api/_helpers/routeHandler'
import rendaController from '@/controllers/rendaController'

export async function GET(request, { params }) {
  return handleRequest(request, async (req) => {
    const { idUsuario } = await params
    const url = new URL(req.url)
    const filtros = {
      mes: url.searchParams.get('mes'),
      ano: url.searchParams.get('ano'),
    }
    return rendaController.listarPorUsuario(idUsuario, filtros)
  }, { auth: true })
}
