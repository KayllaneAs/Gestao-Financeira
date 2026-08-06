import { Op } from 'sequelize'
import models from '@/models/index.js'
import cacheService, { CACHE_KEYS, TTL } from './cacheService.js'
import categorizacaoService from './categorizacaoService.js'

const { Despesa, ContaCartao, ParcelamentoAgrupador, sequelize } = models

class DespesaService {
  async criar(dados) {
    const numeroParcelas = dados.Numero_Parcelas || 1

    /*
     * US36 - CA01:
     * Quando o usuário não selecionar uma categoria, o sistema tenta
     * sugerir uma automaticamente pela descrição da despesa.
     */
    const categoriaSugerida = dados.Categoria?.trim()
      ? null
      : categorizacaoService.sugerirCategoria(dados.Descricao_Despesa)

    /*
     * US36 - CA03:
     * O model exige uma categoria. Quando nenhuma sugestão for encontrada,
     * a transação é salva como "Outros", mas o retorno informa claramente
     * que nenhuma categoria específica pôde ser sugerida.
     */
    const categoriaFinal = dados.Categoria?.trim() || categoriaSugerida || 'Outros'
    const categorizadaAutomaticamente = Boolean(categoriaSugerida)

    if (numeroParcelas <= 1) {
      const despesa = await Despesa.create({
        Id_Usuario: dados.Id_Usuario,
        Id_Conta: dados.Id_Conta,
        Descricao_Despesa: dados.Descricao_Despesa,
        Valor_Parcela: dados.Valor_Parcela || dados.Valor_Total || 0,
        Data: dados.Data,
        Categoria: categoriaFinal,
        Numero_Parcela: 1
      })

      /*
       * US36 - CA02:
       * Limpa os caches do usuário para que dashboard e relatórios
       * sejam atualizados após a categorização.
       */
      cacheService.invalidateUser(dados.Id_Usuario)

      const despesaCompleta = await this.buscarPorId(despesa.Id_Despesa)

      return {
        despesa: despesaCompleta,
        categorizada_automaticamente: categorizadaAutomaticamente,
        categoria_sugerida: categoriaSugerida,
        mensagem: categorizadaAutomaticamente
          ? `Transação categorizada automaticamente como ${categoriaSugerida}.`
          : dados.Categoria?.trim()
            ? 'Despesa criada com a categoria selecionada.'
            : 'Nenhuma categoria específica pôde ser sugerida. A despesa foi classificada como Outros.'
      }
    }

    const transaction = await sequelize.transaction()

    try {
      const valorTotal = parseFloat(dados.Valor_Total || 0)
      const valorParcela = parseFloat((valorTotal / numeroParcelas).toFixed(2))

      const parcelamento = await ParcelamentoAgrupador.create({
        Id_Usuario: dados.Id_Usuario,
        Descricao_Parcela: dados.Descricao_Despesa,
        Valor_Total: valorTotal,
        Qtd_Parcelas: numeroParcelas,
        Data_Inicio: dados.Data
      }, { transaction })

      const despesasCriadas = []
      const dataBase = new Date(dados.Data)

      for (let i = 0; i < numeroParcelas; i++) {
        const dataParcela = new Date(dataBase)
        dataParcela.setMonth(dataParcela.getMonth() + i)
        const dataFormatada = dataParcela.toISOString().split('T')[0]

        const despesa = await Despesa.create({
          Id_Usuario: dados.Id_Usuario,
          Id_Conta: dados.Id_Conta,
          Id_Parcelamento: parcelamento.Id_Parcelamento,
          Descricao_Despesa: dados.Descricao_Despesa,
          Valor_Parcela: valorParcela,
          Data: dataFormatada,
          Categoria: categoriaFinal,
          Numero_Parcela: i + 1
        }, { transaction })

        despesasCriadas.push(despesa)
      }

      await transaction.commit()

      // US36 - CA02: atualiza dashboard e relatórios após o parcelamento.
      cacheService.invalidateUser(dados.Id_Usuario)

      return {
        parcelamento,
        despesas: despesasCriadas,
        categorizada_automaticamente: categorizadaAutomaticamente,
        categoria_sugerida: categoriaSugerida,
        mensagem: categorizadaAutomaticamente
          ? `Parcelamento categorizado automaticamente como ${categoriaSugerida}.`
          : dados.Categoria?.trim()
            ? 'Parcelamento criado com a categoria selecionada.'
            : 'Nenhuma categoria específica pôde ser sugerida. O parcelamento foi classificado como Outros.'
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async buscarPorId(id) {
    const despesa = await Despesa.findByPk(id, {
      include: [
        {
          model: ContaCartao,
          as: 'conta',
          attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
        },
        {
          model: ParcelamentoAgrupador,
          as: 'parcelamento',
          attributes: ['Id_Parcelamento', 'Descricao_Parcela', 'Qtd_Parcelas', 'Valor_Total']
        }
      ]
    })

    if (!despesa) {
      const error = new Error('Despesa não encontrada')
      error.statusCode = 404
      throw error
    }

    return despesa
  }

  _buildWhereClause(idUsuario, filtros = {}) {
    const where = { Id_Usuario: idUsuario }

    if (filtros.mes && filtros.ano) {
      const mes = parseInt(filtros.mes)
      const ano = parseInt(filtros.ano)
      const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
      const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0]
      where.Data = { [Op.between]: [primeiroDia, ultimoDia] }
    } else if (filtros.dataInicio && filtros.dataFim) {
      where.Data = { [Op.between]: [filtros.dataInicio, filtros.dataFim] }
    } else if (filtros.dataInicio) {
      where.Data = { [Op.gte]: filtros.dataInicio }
    } else if (filtros.dataFim) {
      where.Data = { [Op.lte]: filtros.dataFim }
    }

    if (filtros.categoria) {
      where.Categoria = filtros.categoria
    }

    if (filtros.idConta) {
      where.Id_Conta = filtros.idConta
    }

    return where
  }

  async listarPorUsuario(idUsuario, filtros = {}, options = {}) {
    const where = this._buildWhereClause(idUsuario, filtros)

    const queryOptions = {
      where,
      include: [
        {
          model: ContaCartao,
          as: 'conta',
          attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
        },
        {
          model: ParcelamentoAgrupador,
          as: 'parcelamento',
          attributes: ['Id_Parcelamento', 'Descricao_Parcela', 'Qtd_Parcelas', 'Valor_Total']
        }
      ],
      order: [['Data', 'DESC']]
    }

    if (options.limit) {
      queryOptions.limit = options.limit
    }

    if (options.offset) {
      queryOptions.offset = options.offset
    }

    return Despesa.findAll(queryOptions)
  }

  async calcularTotalPorPeriodo(idUsuario, filtros = {}) {
    const cacheKey = cacheService.generateKey(
      CACHE_KEYS.DESPESAS_LISTA,
      idUsuario,
      { ...filtros, type: 'total' }
    )

    return cacheService.getOrSet(cacheKey, async () => {
      const where = this._buildWhereClause(idUsuario, filtros)

      const result = await Despesa.findOne({
        where,
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('valor_parcela')), 0), 'total']
        ],
        raw: true
      })

      return parseFloat(parseFloat(result?.total || 0).toFixed(2))
    }, TTL.SHORT)
  }

  async calcularPorCategoria(idUsuario, filtros = {}) {
    const cacheKey = cacheService.generateKey(
      CACHE_KEYS.DESPESAS_CATEGORIA,
      idUsuario,
      filtros
    )

    return cacheService.getOrSet(cacheKey, async () => {
      const where = this._buildWhereClause(idUsuario, filtros)

      const results = await Despesa.findAll({
        where,
        attributes: [
          'Categoria',
          [sequelize.fn('SUM', sequelize.col('valor_parcela')), 'total']
        ],
        group: ['Categoria'],
        raw: true
      })

      return results.map((resultado) => ({
        categoria: resultado.Categoria,
        total: parseFloat(parseFloat(resultado.total || 0).toFixed(2))
      }))
    }, TTL.MEDIUM)
  }

  async topDespesas(idUsuario, filtros = {}, limite = 5) {
    const cacheKey = cacheService.generateKey(
      CACHE_KEYS.DESPESAS_TOP,
      idUsuario,
      { ...filtros, limite }
    )

    return cacheService.getOrSet(cacheKey, async () => {
      const where = this._buildWhereClause(idUsuario, filtros)

      return Despesa.findAll({
        where,
        include: [
          {
            model: ContaCartao,
            as: 'conta',
            attributes: ['Id_Conta', 'Nome_Conta', 'Tipo', 'Cor_Hex']
          }
        ],
        order: [['Valor_Parcela', 'DESC']],
        limit: limite
      })
    }, TTL.MEDIUM)
  }

  async exportarCSV(idUsuario, filtros = {}) {
    const where = this._buildWhereClause(idUsuario, filtros)

    const despesas = await Despesa.findAll({
      where,
      attributes: ['Descricao_Despesa', 'Valor_Parcela', 'Data', 'Categoria', 'Numero_Parcela'],
      include: [
        {
          model: ContaCartao,
          as: 'conta',
          attributes: ['Nome_Conta']
        },
        {
          model: ParcelamentoAgrupador,
          as: 'parcelamento',
          attributes: ['Qtd_Parcelas']
        }
      ],
      order: [['Data', 'DESC']]
    })

    const header = 'Descricao;Valor;Data;Categoria;Conta;Parcela\n'

    const linhas = despesas.map((despesa) => [
      despesa.Descricao_Despesa,
      parseFloat(despesa.Valor_Parcela).toFixed(2).replace('.', ','),
      despesa.Data,
      despesa.Categoria,
      despesa.conta?.Nome_Conta || '',
      despesa.parcelamento
        ? `${despesa.Numero_Parcela}/${despesa.parcelamento.Qtd_Parcelas}`
        : 'À vista'
    ].join(';')).join('\n')

    return header + linhas
  }

  async atualizar(id, dados) {
    const despesa = await this.buscarPorId(id)

    /*
     * US36 - CA01:
     * Na edição, se a categoria for apagada, o sistema tenta sugerir
     * uma nova categoria com base na descrição atualizada.
     */
    const descricao = dados.Descricao_Despesa || despesa.Descricao_Despesa

    if (!dados.Categoria?.trim()) {
      dados.Categoria =
        categorizacaoService.sugerirCategoria(descricao) || 'Outros'
    }

    await despesa.update(dados)

    // US36 - CA02: força atualização dos dados após editar a categoria.
    cacheService.invalidateUser(despesa.Id_Usuario)

    return this.buscarPorId(id)
  }

  async deletar(id, deletarParcelamento = false) {
    const despesa = await this.buscarPorId(id)
    const userId = despesa.Id_Usuario

    if (deletarParcelamento && despesa.Id_Parcelamento) {
      const parcelamento = await ParcelamentoAgrupador.findByPk(despesa.Id_Parcelamento)

      if (parcelamento) {
        await parcelamento.destroy()
        cacheService.invalidateUser(userId)

        return {
          mensagem: 'Parcelamento e todas as parcelas deletados com sucesso'
        }
      }
    }

    await despesa.destroy()
    cacheService.invalidateUser(userId)

    return {
      mensagem: 'Despesa deletada com sucesso'
    }
  }
}

export default new DespesaService()
