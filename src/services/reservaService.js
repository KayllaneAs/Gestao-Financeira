import models from '@/models/index.js'

const { Reserva } = models

class ReservaService {
  async criar(dados) {
    const reserva = await Reserva.create(dados)
    return reserva
  }

  async buscarPorId(id) {
    const reserva = await Reserva.findByPk(id)
    if (!reserva) {
      throw new Error('Reserva não encontrada')
    }
    return reserva
  }

  async listarPorUsuario(idUsuario) {
    const reservas = await Reserva.findAll({
      where: { Id_Usuario: idUsuario },
      order: [['Nome_Objetivo', 'ASC']]
    })

    const reservasComProgresso = reservas.map(reserva => {
      const reservaJSON = reserva.toJSON()
      const progresso = (parseFloat(reserva.Valor_Atual) / parseFloat(reserva.Valor_Alvo)) * 100
      return {
        ...reservaJSON,
        progresso: Math.min(progresso, 100).toFixed(2)
      }
    })
    return reservasComProgresso
  }

  async atualizar(id, dados) {
    const reserva = await this.buscarPorId(id)
    await reserva.update(dados)
    return reserva
  }

  async adicionarValor(id, valor) {
    const reserva = await this.buscarPorId(id)
    const novoValor = parseFloat(reserva.Valor_Atual) + parseFloat(valor)
    await reserva.update({ Valor_Atual: novoValor })
    return reserva
  }

  async retirarValor(id, valor) {
    const reserva = await this.buscarPorId(id)
    const novoValor = parseFloat(reserva.Valor_Atual) - parseFloat(valor)
    if (novoValor < 0) {
      throw new Error('Valor insuficiente na reserva')
    }
    await reserva.update({ Valor_Atual: novoValor })
    return reserva
  }

  async deletar(id) {
    const reserva = await this.buscarPorId(id)
    await reserva.destroy()
    return { mensagem: 'Reserva deletada com sucesso' }
  }
}

export default new ReservaService()
