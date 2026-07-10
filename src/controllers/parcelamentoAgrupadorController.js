import parcelamentoAgrupadorService from '@/services/parcelamentoAgrupadorService.js'

class ParcelamentoAgrupadorController {
  async criar(body) {
    const parcelamento = await parcelamentoAgrupadorService.criar(body)
    return { status: 201, data: parcelamento }
  }

  async buscarPorId(id) {
    const parcelamento = await parcelamentoAgrupadorService.buscarPorId(id)
    return { status: 200, data: parcelamento }
  }

  async listarPorUsuario(idUsuario) {
    const parcelamentos = await parcelamentoAgrupadorService.listarPorUsuario(idUsuario)
    return { status: 200, data: parcelamentos }
  }

  async dividasFuturas(idUsuario) {
    const dividas = await parcelamentoAgrupadorService.calcularDividasFuturas(idUsuario)
    return { status: 200, data: dividas }
  }

  async cronograma(idUsuario) {
    const cronograma = await parcelamentoAgrupadorService.cronogramaPagamentos(idUsuario)
    return { status: 200, data: cronograma }
  }

  async faturaPorCartao(idUsuario, mes, ano) {
    if (!mes || !ano) {
      return { status: 400, error: 'Mês e ano são obrigatórios' }
    }
    const fatura = await parcelamentoAgrupadorService.faturaPorCartao(idUsuario, parseInt(mes), parseInt(ano))
    return { status: 200, data: fatura }
  }

  async atualizar(id, body) {
    const parcelamento = await parcelamentoAgrupadorService.atualizar(id, body)
    return { status: 200, data: parcelamento }
  }

  async deletar(id) {
    const resultado = await parcelamentoAgrupadorService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new ParcelamentoAgrupadorController()
