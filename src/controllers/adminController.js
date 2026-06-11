import adminService from '@/services/adminService.js'

class AdminController {
  async listarUsuarios() {
    const usuarios = await adminService.listarUsuarios()
    return { status: 200, data: usuarios }
  }

  async estatisticasSistema() {
    const stats = await adminService.buscarEstatisticasSistema()
    return { status: 200, data: stats }
  }

  async atualizarCargo(id, body) {
    const { cargo } = body
    if (!cargo) {
      return { status: 400, error: 'Campo "cargo" é obrigatório' }
    }
    const usuario = await adminService.atualizarCargo(id, cargo)
    return { status: 200, data: usuario }
  }

  async deletarUsuario(id, adminId) {
    const resultado = await adminService.deletarUsuario(id, adminId)
    return { status: 200, data: resultado }
  }

  async buscarUsuario(id) {
    const usuario = await adminService.buscarUsuario(id)
    return { status: 200, data: usuario }
  }
}

export default new AdminController()
