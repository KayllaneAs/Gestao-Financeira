import { handleRequest } from '@/app/api/_helpers/routeHandler'
import adminController from '@/controllers/adminController'

export async function PUT(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    const body = await req.json()
    return adminController.atualizarCargo(id, body)
  }, { adminOnly: true })
}
