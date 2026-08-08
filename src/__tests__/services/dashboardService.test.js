jest.mock('@/services/despesaService.js', () => ({
  __esModule: true,
  default: {
    calcularTotalPorPeriodo: jest.fn(),
    calcularPorCategoria: jest.fn(),
    topDespesas: jest.fn(),
    listarPorUsuario: jest.fn(),
  },
}))

jest.mock('@/services/rendaService.js', () => ({
  __esModule: true,
  default: {
    calcularTotalPorPeriodo: jest.fn(),
    listarPorUsuario: jest.fn(),
  },
}))

jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Despesa: {
      findAll: jest.fn(),
    },
    Renda: {
      findAll: jest.fn(),
    },
    ContaCartao: {},
    sequelize: {
      fn: jest.fn((name, ...args) => ({
        fn: name,
        args,
      })),
      col: jest.fn((name) => ({
        col: name,
      })),
      literal: jest.fn((val) => ({
        literal: val,
      })),
    },
  },
}))

jest.mock('@/services/cacheService.js', () => ({
  __esModule: true,
  default: {
    generateKey: jest.fn(() => 'cache-key'),
    getOrSet: jest.fn((key, fn) => fn()),
    invalidateUser: jest.fn(),
  },
  CACHE_KEYS: {
    DASHBOARD_RESUMO: 'dashboard:resumo',
    DASHBOARD_RELATORIO: 'dashboard:relatorio',
  },
  TTL: {
    MEDIUM: 600000,
    LONG: 1800000,
  },
}))

import dashboardService from '@/services/dashboardService.js'
import despesaService from '@/services/despesaService.js'
import rendaService from '@/services/rendaService.js'
import models from '@/models/index.js'

const { Renda, Despesa } = models

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('resumoMensal', () => {
    it('deve retornar resumo financeiro do mes', async () => {
      rendaService.calcularTotalPorPeriodo.mockResolvedValue(3000)
      despesaService.calcularTotalPorPeriodo.mockResolvedValue(500)

      despesaService.calcularPorCategoria.mockResolvedValue([
        {
          categoria: 'Alimentação',
          total: 300,
        },
        {
          categoria: 'Transporte',
          total: 200,
        },
      ])

      despesaService.topDespesas.mockResolvedValue([
        {
          Id_Despesa: 'd1',
          Valor_Parcela: 300,
        },
      ])

      const result = await dashboardService.resumoMensal(
        'u1',
        7,
        2026
      )

      expect(result.mes).toBe(7)
      expect(result.ano).toBe(2026)
      expect(result.total_rendas).toBe(3000)
      expect(result.total_despesas).toBe(500)
      expect(result.saldo_liquido).toBe(2500)
    })

    it('deve calcular saldo liquido negativo corretamente', async () => {
      rendaService.calcularTotalPorPeriodo.mockResolvedValue(500)
      despesaService.calcularTotalPorPeriodo.mockResolvedValue(1000)
      despesaService.calcularPorCategoria.mockResolvedValue([])
      despesaService.topDespesas.mockResolvedValue([])

      const result = await dashboardService.resumoMensal(
        'u1',
        7,
        2026
      )

      expect(result.saldo_liquido).toBe(-500)
    })

    it('deve retornar zeros quando nao ha registros', async () => {
      rendaService.calcularTotalPorPeriodo.mockResolvedValue(0)
      despesaService.calcularTotalPorPeriodo.mockResolvedValue(0)
      despesaService.calcularPorCategoria.mockResolvedValue([])
      despesaService.topDespesas.mockResolvedValue([])

      const result = await dashboardService.resumoMensal(
        'u1',
        7,
        2026
      )

      expect(result.total_rendas).toBe(0)
      expect(result.total_despesas).toBe(0)
      expect(result.saldo_liquido).toBe(0)
      expect(result.despesas_por_categoria).toHaveLength(0)
      expect(result.top_5_despesas).toHaveLength(0)
    })

    it('deve incluir despesas por categoria e top 5', async () => {
      rendaService.calcularTotalPorPeriodo.mockResolvedValue(3000)
      despesaService.calcularTotalPorPeriodo.mockResolvedValue(500)

      despesaService.calcularPorCategoria.mockResolvedValue([
        {
          categoria: 'Alimentação',
          total: 300,
        },
      ])

      despesaService.topDespesas.mockResolvedValue([
        {
          Id_Despesa: 'd1',
          Descricao_Despesa: 'Mercado',
          Valor_Parcela: 300,
        },
      ])

      const result = await dashboardService.resumoMensal(
        'u1',
        7,
        2026
      )

      expect(result.despesas_por_categoria).toHaveLength(1)
      expect(result.top_5_despesas).toHaveLength(1)
      expect(result.despesas_por_categoria[0].categoria).toBe(
        'Alimentação'
      )
      expect(result.top_5_despesas[0].Descricao_Despesa).toBe(
        'Mercado'
      )
    })
  })

  describe('relatorioAnual', () => {
    it('deve retornar relatorio anual com evolucao mensal de 12 meses', async () => {
      Renda.findAll.mockResolvedValue([
        {
          mes: '7',
          total: '3000',
        },
      ])

      Despesa.findAll
        .mockResolvedValueOnce([
          {
            mes: '7',
            total: '500',
          },
        ])
        .mockResolvedValueOnce([])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const result = await dashboardService.relatorioAnual(
        'u1',
        2026
      )

      expect(result.ano).toBe(2026)
      expect(result.evolucao_mensal).toHaveLength(12)
      expect(result.resumo).toBeDefined()
      expect(result.resumo.total_rendas).toBeDefined()
      expect(result.resumo.total_despesas).toBeDefined()
      expect(result.resumo.saldo_final).toBeDefined()

      expect(result.evolucao_mensal[6]).toEqual({
        mes: 7,
        total_rendas: 3000,
        total_despesas: 500,
        saldo: 2500,
      })
    })

    it('deve calcular totais anuais corretamente', async () => {
      Renda.findAll.mockResolvedValue([
        {
          mes: '1',
          total: '1000',
        },
        {
          mes: '2',
          total: '2000',
        },
      ])

      Despesa.findAll
        .mockResolvedValueOnce([
          {
            mes: '1',
            total: '500',
          },
        ])
        .mockResolvedValueOnce([])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const result = await dashboardService.relatorioAnual(
        'u1',
        2026
      )

      expect(result.resumo.total_rendas).toBe(3000)
      expect(result.resumo.total_despesas).toBe(500)
      expect(result.resumo.saldo_final).toBe(2500)
    })

    it('deve ignorar despesas que nao possuem conta', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            conta: null,
          },
          {
            conta: {
              id_conta: 'c1',
              nome_conta: 'Nubank',
              tipo: 'cartao',
              cor_hex: '#000000',
            },
            total: '500',
            quantidade: '2',
          },
        ])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const result = await dashboardService.relatorioAnual(
        'u1',
        2026
      )

      expect(result.despesas_por_conta).toHaveLength(1)
      expect(
        result.despesas_por_conta[0].conta.nome_conta
      ).toBe('Nubank')

      expect(result.despesas_por_conta[0].total).toBe(500)
      expect(result.despesas_por_conta[0].quantidade).toBe(2)
    })

    it('deve usar dataValues quando os valores estiverem presentes', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            conta: {
              id_conta: 'c1',
              nome_conta: 'Nubank',
              tipo: 'cartao',
              cor_hex: '#000000',
            },
            dataValues: {
              total: '750.50',
              quantidade: '3',
            },
          },
        ])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const result = await dashboardService.relatorioAnual(
        'u1',
        2026
      )

      expect(result.despesas_por_conta[0].total).toBe(750.5)
      expect(result.despesas_por_conta[0].quantidade).toBe(3)
    })

    it('deve usar valores diretamente quando dataValues nao possuir os campos', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            conta: {
              id_conta: 'c1',
              nome_conta: 'Inter',
              tipo: 'conta',
              cor_hex: '#FFFFFF',
            },
            dataValues: {},
            total: '350',
            quantidade: '5',
          },
        ])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const result = await dashboardService.relatorioAnual(
        'u1',
        2026
      )

      expect(result.despesas_por_conta[0].total).toBe(350)
      expect(result.despesas_por_conta[0].quantidade).toBe(5)
    })

    it('deve usar zero quando total e quantidade nao estiverem disponiveis', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            conta: {
              id_conta: 'c1',
              nome_conta: 'Carteira',
              tipo: 'dinheiro',
              cor_hex: '#123456',
            },
            dataValues: {},
          },
        ])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const result = await dashboardService.relatorioAnual(
        'u1',
        2026
      )

      expect(result.despesas_por_conta[0].total).toBe(0)
      expect(result.despesas_por_conta[0].quantidade).toBe(0)
    })
  })

  describe('exportarRelatorioAnualCSV', () => {
    it('deve exportar CSV com cabecalho e dados mensais', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      despesaService.calcularPorCategoria.mockResolvedValue([
        {
          categoria: 'Alimentação',
          total: 300,
        },
      ])

      rendaService.listarPorUsuario.mockResolvedValue([])

      const csv = await dashboardService.exportarRelatorioAnualCSV(
        'u1',
        2026
      )

      expect(csv).toContain('RELATÓRIO ANUAL 2026')
      expect(csv).toContain('Total Rendas')
      expect(csv).toContain('Total Despesas')
      expect(csv).toContain('Saldo Final')
      expect(csv).toContain('MÊS;RENDAS;DESPESAS;SALDO')
      expect(csv).toContain('Jan')
      expect(csv).toContain('DESPESAS POR CATEGORIA')
      expect(csv).toContain('CATEGORIA;TOTAL')
      expect(csv).toContain('Alimentação')
    })

    it('deve incluir despesas por conta no CSV', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            conta: {
              id_conta: 'c1',
              nome_conta: 'Nubank',
              tipo: 'cartao',
              cor_hex: '#000000',
            },
            total: '1200',
            quantidade: '4',
          },
        ])

      despesaService.calcularPorCategoria.mockResolvedValue([])
      rendaService.listarPorUsuario.mockResolvedValue([])

      const csv = await dashboardService.exportarRelatorioAnualCSV(
        'u1',
        2026
      )

      expect(csv).toContain('DESPESAS POR CONTA')
      expect(csv).toContain('CONTA;TIPO;TOTAL;QUANTIDADE')
      expect(csv).toContain('Nubank;cartao;1200,00;4')
    })

    it('deve exportar categorias com valores decimais formatados', async () => {
      Renda.findAll.mockResolvedValue([])

      Despesa.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      despesaService.calcularPorCategoria.mockResolvedValue([
        {
          categoria: 'Alimentação',
          total: 1250.75,
        },
        {
          categoria: 'Transporte',
          total: 80.5,
        },
      ])

      rendaService.listarPorUsuario.mockResolvedValue([])

      const csv = await dashboardService.exportarRelatorioAnualCSV(
        'u1',
        2026
      )

      expect(csv).toContain('Alimentação;1250,75')
      expect(csv).toContain('Transporte;80,50')
    })
  })
})
