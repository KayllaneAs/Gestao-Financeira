import rendaService from '@/services/rendaService.js'

class RendaController {
  async criar(body) {
    const renda = await rendaService.criar(body)
    return { status: 201, data: renda }
  }

  async buscarPorId(id) {
    const renda = await rendaService.buscarPorId(id)
    return { status: 200, data: renda }
  }

  async listarPorUsuario(idUsuario, filtros) {
    const rendas = await rendaService.listarPorUsuario(idUsuario, filtros)
    return { status: 200, data: rendas }
  }

  async atualizar(id, body) {
    const renda = await rendaService.atualizar(id, body)
    return { status: 200, data: renda }
  }
}

export default new RendaController()
