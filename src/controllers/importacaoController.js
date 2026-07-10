import importacaoService from '@/services/importacaoService.js'

class ImportacaoController {
  async preview(body) {
    const { csv } = body
    if (!csv || typeof csv !== 'string') {
      return { status: 400, error: 'Envie o conteúdo do CSV no campo "csv"' }
    }
    const resultado = importacaoService.parsearPreview(csv)
    return { status: 200, data: resultado }
  }

  async processar(body) {
    const { csv, colData, colDesc, colValor, ignorarNegativo } = body
    if (!csv) return { status: 400, error: 'Campo "csv" obrigatório' }
    if (colData === undefined || colDesc === undefined || colValor === undefined) {
      return { status: 400, error: 'Informe colData, colDesc e colValor' }
    }
    const resultado = importacaoService.processarCSV(csv, {
      colData: Number(colData),
      colDesc: Number(colDesc),
      colValor: Number(colValor),
      ignorarNegativo: Boolean(ignorarNegativo),
    })
    return { status: 200, data: resultado }
  }

  async confirmar(body, idUsuario) {
    const { idConta, transacoes, grupos } = body
    if (!idConta) return { status: 400, error: 'Selecione uma conta/cartão' }
    if (!transacoes?.length && !grupos?.length) {
      return { status: 400, error: 'Nenhuma transação para importar' }
    }
    const resultado = await importacaoService.confirmarImportacao({
      idUsuario,
      idConta,
      transacoes: transacoes || [],
      grupos: grupos || [],
    })
    return { status: 201, data: resultado }
  }

  async desfazer(body, idUsuario) {
    const { idsParcelamentos, idsDespesasAvulsas } = body
    if (!idsParcelamentos?.length && !idsDespesasAvulsas?.length) {
      return { status: 400, error: 'Nenhum ID informado para desfazer' }
    }
    const resultado = await importacaoService.desfazerImportacao({
      idUsuario,
      idsParcelamentos: idsParcelamentos || [],
      idsDespesasAvulsas: idsDespesasAvulsas || [],
    })
    return { status: 200, data: resultado }
  }
}

export default new ImportacaoController()
