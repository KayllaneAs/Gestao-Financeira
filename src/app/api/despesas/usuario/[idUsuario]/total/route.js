import { handleRequest } from '@/app/api/_helpers/routeHandler'
import despesaController from '@/controllers/despesaController'

export async function GET(request, { params }) {
  return handleRequest(request, async (req) => {
    const { idUsuario } = await params
    const { searchParams } = new URL(req.url)
    const filtros = {
      mes: searchParams.get('mes'),
      ano: searchParams.get('ano'),
      categoria: searchParams.get('categoria'),
      idConta: searchParams.get('idConta'),
      dataInicio: searchParams.get('dataInicio'),
      dataFim: searchParams.get('dataFim')
    }
    return despesaController.listarPorUsuario(idUsuario, filtros)
  })
}
