import { handleRequest } from '@/app/api/_helpers/routeHandler'
import importacaoController from '@/controllers/importacaoController'

// POST /api/importar-csv  → preview das colunas
export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return importacaoController.preview(body)
  }, { auth: false })
}
