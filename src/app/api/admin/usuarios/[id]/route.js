import { handleRequest } from '@/app/api/_helpers/routeHandler'
import adminController from '@/controllers/adminController'

export async function GET(request, { params }) {
  return handleRequest(request, async () => {
    const { id } = await params
    return adminController.buscarUsuario(id)
  }, { adminOnly: true })
}

export async function DELETE(request, { params }) {
  return handleRequest(request, async (req) => {
    const { id } = await params
    return adminController.deletarUsuario(id, req.usuarioId)
  }, { adminOnly: true })
}
