import contaCartaoService from '@/services/contaCartaoService.js'

class ContaCartaoController {
  async criar(body) {
    const { Nome_Conta, Tipo, Titular, Cor_Hex, Id_Usuario } = body

    if (!Nome_Conta || !Tipo || !Titular || !Cor_Hex || !Id_Usuario) {
      const err = new Error('Campos obrigatórios ausentes: nome_conta, tipo, titular, cor_hex')
      err.status = 400
      throw err
    }

    const tiposValidos = ['Corrente', 'Crédito', 'Dinheiro']
    if (!tiposValidos.includes(Tipo)) {
      const err = new Error(`Tipo inválido. Use: ${tiposValidos.join(', ')}`)
      err.status = 400
      throw err
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(Cor_Hex)) {
      const err = new Error('Cor_Hex deve ser um código hexadecimal válido (ex: #6366f1)')
      err.status = 400
      throw err
    }

    const conta = await contaCartaoService.criar(body)
    return { status: 201, data: conta }
  }

  async buscarPorId(id) {
    const conta = await contaCartaoService.buscarPorId(id)
    return { status: 200, data: conta }
  }

  async listarPorUsuario(idUsuario, tipo) {
    const contas = await contaCartaoService.listarPorUsuario(idUsuario, tipo)
    return { status: 200, data: contas }
  }

  async atualizar(id, body) {
    const conta = await contaCartaoService.atualizar(id, body)
    return { status: 200, data: conta }
  }

  async deletar(id) {
    const resultado = await contaCartaoService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new ContaCartaoController()
