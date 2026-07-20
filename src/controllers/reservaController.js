import reservaService from '@/services/reservaService.js'

class ReservaController {
  async criar(body) {
    const reserva = await reservaService.criar(body)
    return { status: 201, data: reserva }
  }

  async buscarPorId(id) {
    const reserva = await reservaService.buscarPorId(id)
    return { status: 200, data: reserva }
  }

  async listarPorUsuario(idUsuario) {
    const reservas = await reservaService.listarPorUsuario(idUsuario)
    return { status: 200, data: reservas }
  }

  async adicionarValor(id, body) {
    const { valor } = body
    if (!valor || valor <= 0) {
      return { status: 400, error: 'Valor deve ser maior que zero' }
    }
    const reserva = await reservaService.adicionarValor(id, valor)
    return { status: 200, data: reserva }
  }

  async retirarValor(id, body) {
    const { valor } = body
    if (!valor || valor <= 0) {
      return { status: 400, error: 'Valor deve ser maior que zero' }
    }
    const reserva = await reservaService.retirarValor(id, valor)
    return { status: 200, data: reserva }
  }

  async atualizar(id, body) {
    const reserva = await reservaService.atualizar(id, body)
    return { status: 200, data: reserva }
  }

  async deletar(id) {
    const resultado = await reservaService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new ReservaController()
