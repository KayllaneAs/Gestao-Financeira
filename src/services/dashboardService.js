import { Op } from 'sequelize'
import despesaService from '@/services/despesaService.js'
import rendaService from '@/services/rendaService.js'
import models from '@/models/index.js'
import cacheService, { CACHE_KEYS, TTL } from './cacheService.js'

const { Despesa, Renda, ContaCartao, sequelize } = models

class DashboardService {
  async resumoMensal(idUsuario, mes, ano) {
    const cacheKey = cacheService.generateKey(
      CACHE_KEYS.DASHBOARD_RESUMO,
      idUsuario,
      { mes, ano }
    )

    return cacheService.getOrSet(cacheKey, async () => {
      const filtros = { mes, ano }

      const [
        totalRendas,
        totalDespesas,
        despesasPorCategoria,
        topDespesas
      ] = await Promise.all([
        rendaService.calcularTotalPorPeriodo(idUsuario, filtros),
        despesaService.calcularTotalPorPeriodo(idUsuario, filtros),
        despesaService.calcularPorCategoria(idUsuario, filtros),
        despesaService.topDespesas(idUsuario, filtros, 5)
      ])

      const saldoLiquido = parseFloat(
        (totalRendas - totalDespesas).toFixed(2)
      )

      return {
        mes: parseInt(mes),
        ano: parseInt(ano),
        total_rendas: totalRendas,
        total_despesas: totalDespesas,
        saldo_liquido: saldoLiquido,
        despesas_por_categoria: despesasPorCategoria,
        top_5_despesas: topDespesas
      }
    }, TTL.MEDIUM)
  }

  async relatorioAnual(idUsuario, ano) {
    const cacheKey = cacheService.generateKey(
      CACHE_KEYS.DASHBOARD_RELATORIO,
      idUsuario,
      { ano }
    )

    return cacheService.getOrSet(cacheKey, async () => {
      const primeiroDiaAno = `${ano}-01-01`
      const ultimoDiaAno = `${ano}-12-31`

      const [
        rendasMensais,
        despesasMensais,
        despesasPorContaRaw,
        categorias,
        rendasAno
      ] = await Promise.all([
        // RENDAS MENSAIS
        Renda.findAll({
          where: {
            id_usuario: idUsuario,
            data: {
              [Op.between]: [
                primeiroDiaAno,
                ultimoDiaAno
              ]
            }
          },
          attributes: [
            [
              sequelize.fn(
                'EXTRACT',
                sequelize.literal('MONTH FROM "data"')
              ),
              'mes'
            ],
            [
              sequelize.fn(
                'SUM',
                sequelize.col('valor_renda')
              ),
              'total'
            ]
          ],
          group: [
            sequelize.fn(
              'EXTRACT',
              sequelize.literal('MONTH FROM "data"')
            )
          ],
          raw: true
        }),

        // DESPESAS MENSAIS
        Despesa.findAll({
          where: {
            id_usuario: idUsuario,
            data: {
              [Op.between]: [
                primeiroDiaAno,
                ultimoDiaAno
              ]
            }
          },
          attributes: [
            [
              sequelize.fn(
                'EXTRACT',
                sequelize.literal('MONTH FROM "data"')
              ),
              'mes'
            ],
            [
              sequelize.fn(
                'SUM',
                sequelize.col('valor_parcela')
              ),
              'total'
            ]
          ],
          group: [
            sequelize.fn(
              'EXTRACT',
              sequelize.literal('MONTH FROM "data"')
            )
          ],
          raw: true
        }),

        // DESPESAS POR CONTA
        Despesa.findAll({
          where: {
            id_usuario: idUsuario,
            data: {
              [Op.between]: [
                primeiroDiaAno,
                ultimoDiaAno
              ]
            }
          },

          attributes: [
            [
              sequelize.col('Despesa.id_conta'),
              'id_conta'
            ],
            [
              sequelize.fn(
                'SUM',
                sequelize.col('valor_parcela')
              ),
              'total'
            ],
            [
              sequelize.fn(
                'COUNT',
                sequelize.col('id_despesa')
              ),
              'quantidade'
            ]
          ],

          include: [
            {
              model: ContaCartao,
              as: 'conta',

              // CORRIGIDO:
              // usamos os nomes dos atributos do Model
              attributes: [
                'Id_Conta',
                'Nome_Conta',
                'Tipo',
                'Cor_Hex'
              ]
            }
          ],

          group: [
            'Despesa.id_conta',
            'conta.id_conta',
            'conta.nome_conta',
            'conta.tipo',
            'conta.cor_hex'
          ],

          raw: false
        }),

        // DESPESAS POR CATEGORIA
        despesaService.calcularPorCategoria(
          idUsuario,
          {
            dataInicio: primeiroDiaAno,
            dataFim: ultimoDiaAno
          }
        ),

        // RENDAS DO ANO
        rendaService.listarPorUsuario(
          idUsuario,
          {
            dataInicio: primeiroDiaAno,
            dataFim: ultimoDiaAno
          }
        )
      ])

      const rendasMap = new Map(
        rendasMensais.map(r => [
          parseInt(r.mes),
          parseFloat(r.total || 0)
        ])
      )

      const despesasMap = new Map(
        despesasMensais.map(d => [
          parseInt(d.mes),
          parseFloat(d.total || 0)
        ])
      )

      let totalRendasAnual = 0
      let totalDespesasAnual = 0

      const resumosMensais = []

      for (let mes = 1; mes <= 12; mes++) {
        const totalRendas =
          rendasMap.get(mes) || 0

        const totalDespesas =
          despesasMap.get(mes) || 0

        totalRendasAnual += totalRendas
        totalDespesasAnual += totalDespesas

        resumosMensais.push({
          mes,

          total_rendas: parseFloat(
            totalRendas.toFixed(2)
          ),

          total_despesas: parseFloat(
            totalDespesas.toFixed(2)
          ),

          saldo: parseFloat(
            (totalRendas - totalDespesas).toFixed(2)
          )
        })
      }

      // CORRIGIDO
      const despesasPorConta = despesasPorContaRaw
        .filter(d => d.conta)
        .map(d => ({
          conta: {
            id_conta:
              d.conta.Id_Conta,

            nome_conta:
              d.conta.Nome_Conta,

            tipo:
              d.conta.Tipo,

            cor_hex:
              d.conta.Cor_Hex
          },

          total: parseFloat(
            parseFloat(
              d.dataValues?.total ||
              d.total ||
              0
            ).toFixed(2)
          ),

          quantidade: parseInt(
            d.dataValues?.quantidade ||
            d.quantidade ||
            0
          )
        }))

      return {
        ano: parseInt(ano),

        resumo: {
          total_rendas: parseFloat(
            totalRendasAnual.toFixed(2)
          ),

          total_despesas: parseFloat(
            totalDespesasAnual.toFixed(2)
          ),

          saldo_final: parseFloat(
            (
              totalRendasAnual -
              totalDespesasAnual
            ).toFixed(2)
          )
        },

        evolucao_mensal:
          resumosMensais,

        rendas:
          rendasAno,

        despesas_por_conta:
          despesasPorConta,

        despesas_por_categoria:
          categorias
      }
    }, TTL.LONG)
  }

  async exportarRelatorioAnualCSV(idUsuario, ano) {
    const relatorio =
      await this.relatorioAnual(
        idUsuario,
        ano
      )

    let csv =
      `RELATÓRIO ANUAL ${ano}\n\n`

    csv +=
      `Total Rendas;${relatorio.resumo.total_rendas
        .toFixed(2)
        .replace('.', ',')}\n`

    csv +=
      `Total Despesas;${relatorio.resumo.total_despesas
        .toFixed(2)
        .replace('.', ',')}\n`

    csv +=
      `Saldo Final;${relatorio.resumo.saldo_final
        .toFixed(2)
        .replace('.', ',')}\n\n`

    csv +=
      `MÊS;RENDAS;DESPESAS;SALDO\n`

    const meses = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez'
    ]

    relatorio.evolucao_mensal.forEach(m => {
      csv +=
        `${meses[m.mes - 1]};` +
        `${m.total_rendas
          .toFixed(2)
          .replace('.', ',')};` +
        `${m.total_despesas
          .toFixed(2)
          .replace('.', ',')};` +
        `${m.saldo
          .toFixed(2)
          .replace('.', ',')}\n`
    })

    csv +=
      `\nDESPESAS POR CONTA\n`

    csv +=
      `CONTA;TIPO;TOTAL;QUANTIDADE\n`

    relatorio.despesas_por_conta.forEach(c => {
      csv +=
        `${c.conta.nome_conta};` +
        `${c.conta.tipo};` +
        `${c.total
          .toFixed(2)
          .replace('.', ',')};` +
        `${c.quantidade}\n`
    })

    csv +=
      `\nDESPESAS POR CATEGORIA\n`

    csv +=
      `CATEGORIA;TOTAL\n`

    relatorio.despesas_por_categoria.forEach(c => {
      csv +=
        `${c.categoria};` +
        `${c.total
          .toFixed(2)
          .replace('.', ',')}\n`
    })

    return csv
  }
}

export default new DashboardService()