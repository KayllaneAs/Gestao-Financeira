import models from '@/models/index.js'

const { ContaCartao } = models

class ContaCartaoService {
  async criar(dados) {
    const conta = await ContaCartao.create(dados)
    return conta
  }

  async buscarPorId(id) {
    const conta = await ContaCartao.findByPk(id)
    if (!conta) {
      throw new Error('Conta/Cartão não encontrado')
    }
    return conta
  }

  async listarPorUsuario(idUsuario, tipo = null) {
    const where = { Id_Usuario: idUsuario }
    if (tipo) {
      where.Tipo = tipo
    }
    const contas = await ContaCartao.findAll({
      where,
      order: [['Nome_Conta', 'ASC']]
    })
    return contas
  }

  async atualizar(id, dados) {
    const conta = await this.buscarPorId(id)
    await conta.update(dados)
    return conta
  }

  async deletar(id) {
    const conta = await this.buscarPorId(id)
    await conta.destroy()
    return { mensagem: 'Conta/Cartão deletado com sucesso' }
  }
}

export default new ContaCartaoService()
