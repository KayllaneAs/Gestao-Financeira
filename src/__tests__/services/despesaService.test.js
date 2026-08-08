jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Despesa: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn(),
    },
    ContaCartao: {},
    ParcelamentoAgrupador: {
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    sequelize: {
      transaction: jest.fn(),
      fn: jest.fn((name, ...args) => ({ fn: name, args })),
      col: jest.fn((name) => ({ col: name })),
    }
  }
}))

jest.mock('@/services/cacheService.js', () => ({
  __esModule: true,
  default: {
    generateKey: jest.fn(() => 'cache-key'),
    getOrSet: jest.fn((key, fn) => fn()),
    invalidateUser: jest.fn(),
  },
  CACHE_KEYS: {
    DESPESAS_LISTA: 'despesas:lista',
    DESPESAS_CATEGORIA: 'despesas:categoria',
    DESPESAS_TOP: 'despesas:top',
  },
  TTL: { SHORT: 120000, MEDIUM: 600000 }
}))

jest.mock('@/services/categorizacaoService.js', () => ({
  __esModule: true,
  default: {
    sugerirCategoria: jest.fn(),
  }
}))

import despesaService from '@/services/despesaService.js'
import models from '@/models/index.js'
import categorizacaoService from '@/services/categorizacaoService.js'

const { Despesa, ParcelamentoAgrupador, sequelize } = models

const mockDespesa = {
  Id_Despesa: 'd1',
  Id_Usuario: 'u1',
  Id_Conta: 'c1',
  Id_Parcelamento: null,
  Descricao_Despesa: 'Mercado',
  Valor_Parcela: 100,
  Data: '2026-07-01',
  Categoria: 'Alimentação',
  Numero_Parcela: 1,
  conta: { Id_Conta: 'c1', Nome_Conta: 'Inter', Tipo: 'Crédito', Cor_Hex: '#f97316' },
  parcelamento: null,
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
}

describe('DespesaService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('criar - despesa avulsa', () => {
    it('deve criar despesa avulsa com categoria informada', async () => {
      Despesa.create.mockResolvedValue({ Id_Despesa: 'd1' })
      Despesa.findByPk.mockResolvedValue(mockDespesa)

      const result = await despesaService.criar({
        Id_Usuario: 'u1', Id_Conta: 'c1',
        Descricao_Despesa: 'Mercado', Valor_Total: 100,
        Data: '2026-07-01', Categoria: 'Alimentação', Numero_Parcelas: 1
      })

      expect(Despesa.create).toHaveBeenCalledTimes(1)
      expect(result.despesa).toBeDefined()
      expect(result.categorizada_automaticamente).toBe(false)
    })

    it('deve sugerir categoria automaticamente quando nao informada', async () => {
      categorizacaoService.sugerirCategoria.mockReturnValue('Alimentação')
      Despesa.create.mockResolvedValue({ Id_Despesa: 'd1' })
      Despesa.findByPk.mockResolvedValue(mockDespesa)

      const result = await despesaService.criar({
        Id_Usuario: 'u1', Id_Conta: 'c1',
        Descricao_Despesa: 'Mercado Extra', Valor_Total: 100,
        Data: '2026-07-01', Categoria: '', Numero_Parcelas: 1
      })

      expect(categorizacaoService.sugerirCategoria).toHaveBeenCalledWith('Mercado Extra')
      expect(result.categorizada_automaticamente).toBe(true)
      expect(result.categoria_sugerida).toBe('Alimentação')
    })

    it('deve usar categoria Outros quando nao ha sugestao', async () => {
      categorizacaoService.sugerirCategoria.mockReturnValue(null)
      Despesa.create.mockResolvedValue({ Id_Despesa: 'd1' })
      Despesa.findByPk.mockResolvedValue({ ...mockDespesa, Categoria: 'Outros' })

      const result = await despesaService.criar({
        Id_Usuario: 'u1', Id_Conta: 'c1',
        Descricao_Despesa: 'Xpto', Valor_Total: 100,
        Data: '2026-07-01', Categoria: '', Numero_Parcelas: 1
      })

      const createCall = Despesa.create.mock.calls[0][0]
      expect(createCall.Categoria).toBe('Outros')
      expect(result.categorizada_automaticamente).toBe(false)
    })
  })

  describe('criar - despesa parcelada', () => {
    it('deve criar parcelamento atomico com N parcelas', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      }
      sequelize.transaction.mockResolvedValue(mockTransaction)
      ParcelamentoAgrupador.create.mockResolvedValue({ Id_Parcelamento: 'p1' })
      Despesa.create.mockResolvedValue({ Id_Despesa: 'd1' })

      const result = await despesaService.criar({
        Id_Usuario: 'u1', Id_Conta: 'c1',
        Descricao_Despesa: 'TV', Valor_Total: 300,
        Data: '2026-07-01', Categoria: 'Eletrônicos', Numero_Parcelas: 3
      })

      expect(ParcelamentoAgrupador.create).toHaveBeenCalledTimes(1)
      expect(Despesa.create).toHaveBeenCalledTimes(3)
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1)
      expect(result.despesas).toHaveLength(3)
    })

    it('deve fazer rollback quando ocorre erro no parcelamento', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      }
      sequelize.transaction.mockResolvedValue(mockTransaction)
      ParcelamentoAgrupador.create.mockResolvedValue({ Id_Parcelamento: 'p1' })
      Despesa.create.mockRejectedValue(new Error('Erro no banco'))

      await expect(despesaService.criar({
        Id_Usuario: 'u1', Id_Conta: 'c1',
        Descricao_Despesa: 'TV', Valor_Total: 300,
        Data: '2026-07-01', Categoria: 'Eletrônicos', Numero_Parcelas: 3
      })).rejects.toThrow('Erro no banco')

      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1)
      expect(mockTransaction.commit).not.toHaveBeenCalled()
    })

    it('deve dividir valor igualmente entre parcelas', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() }
      sequelize.transaction.mockResolvedValue(mockTransaction)
      ParcelamentoAgrupador.create.mockResolvedValue({ Id_Parcelamento: 'p1' })
      Despesa.create.mockResolvedValue({ Id_Despesa: 'd1' })

      await despesaService.criar({
        Id_Usuario: 'u1', Id_Conta: 'c1',
        Descricao_Despesa: 'TV', Valor_Total: 300,
        Data: '2026-07-01', Categoria: 'Eletrônicos', Numero_Parcelas: 3
      })

      const createCalls = Despesa.create.mock.calls
      createCalls.forEach(([dados]) => {
        expect(dados.Valor_Parcela).toBe(100)
      })
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar despesa com conta e parcelamento', async () => {
      Despesa.findByPk.mockResolvedValue(mockDespesa)

      const result = await despesaService.buscarPorId('d1')
      expect(result.Id_Despesa).toBe('d1')
      expect(result.conta).toBeDefined()
    })

    it('deve lançar erro 404 quando despesa nao encontrada', async () => {
      Despesa.findByPk.mockResolvedValue(null)

      await expect(despesaService.buscarPorId('999'))
        .rejects.toMatchObject({ statusCode: 404, message: 'Despesa não encontrada' })
    })
  })

  describe('_buildWhereClause', () => {
    it('deve filtrar por mes e ano', () => {
      const where = despesaService._buildWhereClause('u1', { mes: 7, ano: 2026 })
      expect(where.Id_Usuario).toBe('u1')
      expect(where.Data).toBeDefined()
    })

    it('deve filtrar por idConta', () => {
      const where = despesaService._buildWhereClause('u1', { idConta: 'c1' })
      expect(where.Id_Conta).toBe('c1')
    })

    it('deve filtrar por categoria', () => {
      const where = despesaService._buildWhereClause('u1', { categoria: 'Alimentação' })
      expect(where.Categoria).toBe('Alimentação')
    })

    it('deve retornar apenas Id_Usuario sem filtros', () => {
      const where = despesaService._buildWhereClause('u1', {})
      expect(where).toEqual({ Id_Usuario: 'u1' })
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar lista de despesas', async () => {
      Despesa.findAll.mockResolvedValue([mockDespesa, mockDespesa])

      const result = await despesaService.listarPorUsuario('u1', { mes: 7, ano: 2026 })
      expect(result).toHaveLength(2)
    })

    it('deve retornar lista vazia quando nao ha despesas', async () => {
      Despesa.findAll.mockResolvedValue([])

      const result = await despesaService.listarPorUsuario('u1', {})
      expect(result).toHaveLength(0)
    })
  })

  describe('calcularTotalPorPeriodo', () => {
    it('deve retornar total de despesas', async () => {
      Despesa.findOne.mockResolvedValue({ total: '500.00' })

      const result = await despesaService.calcularTotalPorPeriodo('u1', { mes: 7, ano: 2026 })
      expect(result).toBe(500)
    })

    it('deve retornar 0 quando nao ha despesas', async () => {
      Despesa.findOne.mockResolvedValue({ total: null })

      const result = await despesaService.calcularTotalPorPeriodo('u1', {})
      expect(result).toBe(0)
    })
  })

  describe('calcularPorCategoria', () => {
    it('deve retornar despesas agrupadas por categoria', async () => {
      Despesa.findAll.mockResolvedValue([
        { Categoria: 'Alimentação', total: '300.00' },
        { Categoria: 'Transporte', total: '150.00' }
      ])

      const result = await despesaService.calcularPorCategoria('u1', { mes: 7, ano: 2026 })
      expect(result).toHaveLength(2)
      expect(result[0].categoria).toBe('Alimentação')
      expect(result[0].total).toBe(300)
    })
  })

  describe('topDespesas', () => {
    it('deve retornar as 5 maiores despesas por padrao', async () => {
      const despesas = Array(5).fill(mockDespesa)
      Despesa.findAll.mockResolvedValue(despesas)

      const result = await despesaService.topDespesas('u1', { mes: 7, ano: 2026 })
      expect(result).toHaveLength(5)
    })
  })

  describe('atualizar', () => {
    it('deve atualizar despesa com categoria informada', async () => {
      Despesa.findByPk.mockResolvedValue(mockDespesa)

      await despesaService.atualizar('d1', { Categoria: 'Saúde' })
      expect(mockDespesa.update).toHaveBeenCalledTimes(1)
    })

    it('deve sugerir categoria quando nao informada na atualizacao', async () => {
      categorizacaoService.sugerirCategoria.mockReturnValue('Transporte')
      Despesa.findByPk.mockResolvedValue(mockDespesa)

      await despesaService.atualizar('d1', { Categoria: '' })
      expect(categorizacaoService.sugerirCategoria).toHaveBeenCalledTimes(1)
    })
  })

  describe('deletar', () => {
    it('deve deletar despesa avulsa', async () => {
      Despesa.findByPk.mockResolvedValue(mockDespesa)

      const result = await despesaService.deletar('d1', false)
      expect(mockDespesa.destroy).toHaveBeenCalledTimes(1)
      expect(result.mensagem).toBe('Despesa deletada com sucesso')
    })

    it('deve deletar parcelamento completo quando deletarParcelamento=true', async () => {
      const despesaParcelada = {
        ...mockDespesa,
        Id_Parcelamento: 'p1',
        Id_Usuario: 'u1',
        destroy: jest.fn(),
      }
      const parcelamento = { destroy: jest.fn().mockResolvedValue(true) }

      Despesa.findByPk.mockResolvedValue(despesaParcelada)
      ParcelamentoAgrupador.findByPk.mockResolvedValue(parcelamento)

      const result = await despesaService.deletar('d1', true)
      expect(parcelamento.destroy).toHaveBeenCalledTimes(1)
      expect(result.mensagem).toBe('Parcelamento e todas as parcelas deletados com sucesso')
    })

    it('deve lançar erro quando despesa nao encontrada', async () => {
      Despesa.findByPk.mockResolvedValue(null)

      await expect(despesaService.deletar('999'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })
})
