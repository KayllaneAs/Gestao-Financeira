import { handleRequest } from '@/app/api/_helpers/routeHandler'
import adminController from '@/controllers/adminController'

export async function GET(request) {
  return handleRequest(request, async () => {
    return adminController.listarUsuarios()
  }, { adminOnly: true })
}
