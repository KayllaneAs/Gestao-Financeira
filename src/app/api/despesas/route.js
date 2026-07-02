import { handleRequest } from '@/app/api/_helpers/routeHandler'
import despesaController from '@/controllers/despesaController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return despesaController.criar(body)
  })
}
