import { handleRequest } from '@/app/api/_helpers/routeHandler'
import reservaController from '@/controllers/reservaController'

export async function POST(request) {
  return handleRequest(request, async (req) => {
    const body = await req.json()
    return reservaController.criar(body)
  })
}
