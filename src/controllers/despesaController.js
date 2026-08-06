import despesaService from '@/services/despesaService.js'

class DespesaController {
  async criar(body) {
    const resultado = await despesaService.criar(body)

    /*
     * US36 - CA03:
     * O retorno inclui a mensagem da categorização para o frontend.
     */
    return {
      status: 201,
      data: resultado
    }
  }

  async buscarPorId(id) {
    const despesa = await despesaService.buscarPorId(id)
    return { status: 200, data: despesa }
  }

  async listarPorUsuario(idUsuario, filtros) {
    const despesas = await despesaService.listarPorUsuario(idUsuario, filtros)
    return { status: 200, data: despesas }
  }

  async calcularTotal(idUsuario, mes, ano) {
    const total = await despesaService.calcularTotalPorPeriodo(idUsuario, { mes, ano })
    return { status: 200, data: total }
  }

  async calcularPorCategoria(idUsuario, mes, ano) {
    const categorias = await despesaService.calcularPorCategoria(idUsuario, { mes, ano })
    return { status: 200, data: categorias }
  }

  async topDespesas(idUsuario, mes, ano, limite) {
    const top = await despesaService.topDespesas(idUsuario, { mes, ano }, limite)
    return { status: 200, data: top }
  }

  async exportarCSV(idUsuario, mes, ano) {
    const csv = await despesaService.exportarCSV(idUsuario, { mes, ano })
    return { status: 200, data: csv, isCSV: true }
  }

  async atualizar(id, body) {
    const despesa = await despesaService.atualizar(id, body)
    return { status: 200, data: despesa }
  }

  async deletar(id, deletarParcelamento) {
    const resultado = await despesaService.deletar(id, deletarParcelamento)
    return { status: 200, data: resultado }
  }
}

export default new DespesaController()
