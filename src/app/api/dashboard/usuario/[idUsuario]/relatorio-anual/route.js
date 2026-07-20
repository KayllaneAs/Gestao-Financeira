import { handleRequest } from '@/app/api/_helpers/routeHandler'
import dashboardController from '@/controllers/dashboardController'

export async function GET(request, { params }) {
  return handleRequest(request, async (req) => {
    const { idUsuario } = await params
    const { searchParams } = new URL(req.url)
    const ano = searchParams.get('ano')
    return dashboardController.relatorioAnual(idUsuario, ano)
  })
}
