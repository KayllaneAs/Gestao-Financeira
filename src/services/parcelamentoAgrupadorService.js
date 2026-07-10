import { Op } from 'sequelize'
import models from '@/models/index.js'

const { ParcelamentoAgrupador, Despesa, ContaCartao } = models

class ParcelamentoAgrupadorService {
  async criar(dados) {
    const parcelamento = await ParcelamentoAgrupador.create(dados)
    return parcelamento
  }

  async buscarPorId(id) {
    const parcelamento = await ParcelamentoAgrupador.findByPk(id, {
      include: [{
        model: Despesa,
        as: 'despesas',
        include: [{
          model: ContaCartao,
          as: 'conta',
          attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
        }],
        separate: true,
        order: [['Numero_Parcela', 'ASC']]
      }]
    })

    if (!parcelamento) {
      const error = new Error('Parcelamento não encontrado')
      error.statusCode = 404
      throw error
    }
    return parcelamento
  }

  async listarPorUsuario(idUsuario) {
    const parcelamentos = await ParcelamentoAgrupador.findAll({
      where: { Id_Usuario: idUsuario },
      include: [{
        model: Despesa,
        as: 'despesas',
        include: [{
          model: ContaCartao,
          as: 'conta',
          attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
        }],
        separate: true,
        order: [['Numero_Parcela', 'ASC']]
      }],
      order: [['Data_Inicio', 'DESC']]
    })

    return parcelamentos.map(p => {
      const pJSON = p.toJSON()
      const hoje = new Date().toISOString().split('T')[0]
      const parcelasPagas = pJSON.despesas.filter(d => d.Data <= hoje).length
      const parcelasRestantes = pJSON.Qtd_Parcelas - parcelasPagas
      const valorRestante = parseFloat((parcelasRestantes * (pJSON.Valor_Total / pJSON.Qtd_Parcelas)).toFixed(2))

      return {
        ...pJSON,
        parcelas_pagas: parcelasPagas,
        parcelas_restantes: parcelasRestantes,
        valor_restante: valorRestante
      }
    })
  }

  async calcularDividasFuturas(idUsuario) {
    const hoje = new Date().toISOString().split('T')[0]
    const despesasFuturas = await Despesa.findAll({
      where: {
        Id_Usuario: idUsuario,
        Id_Parcelamento: { [Op.ne]: null },
        Data: { [Op.gt]: hoje }
      }
    })
    const total = despesasFuturas.reduce((acc, d) => acc + parseFloat(d.Valor_Parcela), 0)
    return parseFloat(total.toFixed(2))
  }

  async cronogramaPagamentos(idUsuario) {
    const hoje = new Date().toISOString().split('T')[0]
    const despesasFuturas = await Despesa.findAll({
      where: {
        Id_Usuario: idUsuario,
        Id_Parcelamento: { [Op.ne]: null },
        Data: { [Op.gt]: hoje }
      },
      include: [{
        model: ParcelamentoAgrupador,
        as: 'parcelamento',
        attributes: ['Descricao_Parcela']
      }],
      order: [['Data', 'ASC']]
    })

    const porMes = {}
    despesasFuturas.forEach(d => {
      const data = new Date(d.Data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`

      if (!porMes[chave]) {
        porMes[chave] = { mes: chave, total: 0, parcelas: [] }
      }

      porMes[chave].total += parseFloat(d.Valor_Parcela)
      porMes[chave].parcelas.push({
        descricao: d.parcelamento?.Descricao_Parcela || d.Descricao_Despesa,
        valor: parseFloat(d.Valor_Parcela),
        parcela: `${d.Numero_Parcela}`,
        data: d.Data
      })
    })

    Object.values(porMes).forEach(m => {
      m.total = parseFloat(m.total.toFixed(2))
    })
    return Object.values(porMes)
  }

  async faturaPorCartao(idUsuario, mes, ano) {
    const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0]

    const contas = await ContaCartao.findAll({
      where: { Id_Usuario: idUsuario }
    })

    const faturas = []

    for (const conta of contas) {
      const despesas = await Despesa.findAll({
        where: {
          Id_Usuario: idUsuario,
          Id_Conta: conta.Id_Conta,
          Data: { [Op.between]: [primeiroDia, ultimoDia] }
        },
        include: [{
          model: ParcelamentoAgrupador,
          as: 'parcelamento',
          attributes: ['Descricao_Parcela', 'Qtd_Parcelas']
        }],
        order: [['Data', 'ASC']]
      })

      if (despesas.length > 0) {
        const totalFatura = despesas.reduce((acc, d) => acc + parseFloat(d.Valor_Parcela), 0)
        faturas.push({
          conta: {
            Id_Conta: conta.Id_Conta,
            Nome_Conta: conta.Nome_Conta,
            Tipo: conta.Tipo,
            Cor_Hex: conta.Cor_Hex,
            Ultimos_Digitos: conta.Ultimos_Digitos
          },
          total_fatura: parseFloat(totalFatura.toFixed(2)),
          quantidade_itens: despesas.length,
          despesas: despesas.map(d => ({
            Id_Despesa: d.Id_Despesa,
            Descricao_Despesa: d.Descricao_Despesa,
            Valor_Parcela: parseFloat(d.Valor_Parcela),
            Data: d.Data,
            Categoria: d.Categoria,
            parcela_info: d.parcelamento
              ? `${d.Numero_Parcela}/${d.parcelamento.Qtd_Parcelas}`
              : 'À vista'
          }))
        })
      }
    }
    return faturas
  }

  async atualizar(id, dados) {
    const parcelamento = await this.buscarPorId(id)
    await parcelamento.update(dados)
    return parcelamento
  }

  async deletar(id) {
    const parcelamento = await this.buscarPorId(id)
    await parcelamento.destroy()
    return { mensagem: 'Parcelamento e todas as parcelas deletados com sucesso' }
  }
}

export default new ParcelamentoAgrupadorService()
