import { Op } from 'sequelize'
import models from '@/models/index.js'
import cacheService, { CACHE_KEYS, TTL } from './cacheService.js'

const { Despesa, ContaCartao, ParcelamentoAgrupador, sequelize } = models

class DespesaService {
  async criar(dados) {
    const numeroParcelas = dados.Numero_Parcelas || 1

    if (numeroParcelas <= 1) {
      const despesa = await Despesa.create({
        Id_Usuario: dados.Id_Usuario,
        Id_Conta: dados.Id_Conta,
        Descricao_Despesa: dados.Descricao_Despesa,
        Valor_Parcela: dados.Valor_Parcela || dados.Valor_Total || 0,
        Data: dados.Data,
        Categoria: dados.Categoria,
        Numero_Parcela: 1
      })
      // Invalidate cache for this user
      cacheService.invalidateUser(dados.Id_Usuario)
      return await this.buscarPorId(despesa.Id_Despesa)
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
          Categoria: dados.Categoria,
          Numero_Parcela: i + 1
        }, { transaction })

        despesasCriadas.push(despesa)
      }

      await transaction.commit()
      // Invalidate cache for this user
      cacheService.invalidateUser(dados.Id_Usuario)
      return { parcelamento, despesas: despesasCriadas }
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

    // Add pagination if provided
    if (options.limit) {
      queryOptions.limit = options.limit
    }
    if (options.offset) {
      queryOptions.offset = options.offset
    }

    const despesas = await Despesa.findAll(queryOptions)
    return despesas
  }

  /**
   * OPTIMIZED: Uses SQL SUM instead of loading all records
   */
  async calcularTotalPorPeriodo(idUsuario, filtros = {}) {
    const cacheKey = cacheService.generateKey(CACHE_KEYS.DESPESAS_LISTA, idUsuario, { ...filtros, type: 'total' })
    
    return cacheService.getOrSet(cacheKey, async () => {
      const where = this._buildWhereClause(idUsuario, filtros)
      
      const result = await Despesa.findOne({
        where,
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Valor_Parcela')), 0), 'total']
        ],
        raw: true
      })
      
      return parseFloat(parseFloat(result?.total || 0).toFixed(2))
    }, TTL.SHORT)
  }

  /**
   * OPTIMIZED: Uses SQL GROUP BY instead of in-memory aggregation
   */
  async calcularPorCategoria(idUsuario, filtros = {}) {
    const cacheKey = cacheService.generateKey(CACHE_KEYS.DESPESAS_CATEGORIA, idUsuario, filtros)
    
    return cacheService.getOrSet(cacheKey, async () => {
      const where = this._buildWhereClause(idUsuario, filtros)
      
      const results = await Despesa.findAll({
        where,
        attributes: [
          'Categoria',
          [sequelize.fn('SUM', sequelize.col('Valor_Parcela')), 'total']
        ],
        group: ['Categoria'],
        raw: true
      })
      
      return results.map(r => ({
        categoria: r.Categoria,
        total: parseFloat(parseFloat(r.total || 0).toFixed(2))
      }))
    }, TTL.MEDIUM)
  }

  /**
   * OPTIMIZED: Uses SQL LIMIT and ORDER instead of loading all then slicing
   */
  async topDespesas(idUsuario, filtros = {}, limite = 5) {
    const cacheKey = cacheService.generateKey(CACHE_KEYS.DESPESAS_TOP, idUsuario, { ...filtros, limite })
    
    return cacheService.getOrSet(cacheKey, async () => {
      const where = this._buildWhereClause(idUsuario, filtros)
      
      const despesas = await Despesa.findAll({
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
      
      return despesas
    }, TTL.MEDIUM)
  }

  async exportarCSV(idUsuario, filtros = {}) {
    // For export, we need specific fields only - optimized query
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
    const linhas = despesas.map(d => {
      return [
        d.Descricao_Despesa,
        parseFloat(d.Valor_Parcela).toFixed(2).replace('.', ','),
        d.Data,
        d.Categoria,
        d.conta?.Nome_Conta || '',
        d.parcelamento ? `${d.Numero_Parcela}/${d.parcelamento.Qtd_Parcelas}` : 'À vista'
      ].join(';')
    }).join('\n')
    return header + linhas
  }

  async atualizar(id, dados) {
    const despesa = await this.buscarPorId(id)
    await despesa.update(dados)
    // Invalidate cache for this user
    cacheService.invalidateUser(despesa.Id_Usuario)
    return await this.buscarPorId(id)
  }

  async deletar(id, deletarParcelamento = false) {
    const despesa = await this.buscarPorId(id)
    const userId = despesa.Id_Usuario

    if (deletarParcelamento && despesa.Id_Parcelamento) {
      const parcelamento = await ParcelamentoAgrupador.findByPk(despesa.Id_Parcelamento)
      if (parcelamento) {
        await parcelamento.destroy()
        cacheService.invalidateUser(userId)
        return { mensagem: 'Parcelamento e todas as parcelas deletados com sucesso' }
      }
    }

    await despesa.destroy()
    cacheService.invalidateUser(userId)
    return { mensagem: 'Despesa deletada com sucesso' }
  }
}

export default new DespesaService()
