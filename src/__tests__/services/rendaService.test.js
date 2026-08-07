jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Renda: {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn(),
    },
    sequelize: {
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
  CACHE_KEYS: { RENDAS_LISTA: 'rendas:lista' },
  TTL: { SHORT: 120000 }
}))

import rendaService from '@/services/rendaService.js'
import models from '@/models/index.js'

const { Renda } = models

describe('RendaService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve criar renda avulsa corretamente', async () => {
      const renda = { Id_Renda: '1', Descricao_Renda: 'Salário', Fixa: false }
      Renda.create.mockResolvedValue(renda)

      const result = await rendaService.criar({
        Id_Usuario: 'u1', Descricao_Renda: 'Salário',
        Valor_Renda: 3000, Data: '2026-07-01', Fixa: false
      })

      expect(Renda.create).toHaveBeenCalledTimes(1)
      expect(result.Descricao_Renda).toBe('Salário')
    })

    it('deve criar 12 registros para renda fixa', async () => {
      const rendas = Array(12).fill({ Id_Renda: '1', Fixa: true })
      Renda.bulkCreate.mockResolvedValue(rendas)

      const result = await rendaService.criar({
        Id_Usuario: 'u1', Descricao_Renda: 'Salário Fixo',
        Valor_Renda: 3000, Data: '2026-07-01',
        Fixa: true, Dia_Vencimento: 5
      })

      expect(Renda.bulkCreate).toHaveBeenCalledTimes(1)
      const registros = Renda.bulkCreate.mock.calls[0][0]
      expect(registros).toHaveLength(12)
      expect(result).toHaveLength(12)
    })

    it('deve gerar datas corretas para os 12 meses da renda fixa', async () => {
      Renda.bulkCreate.mockResolvedValue([])

      await rendaService.criar({
        Id_Usuario: 'u1', Descricao_Renda: 'Salário Fixo',
        Valor_Renda: 3000, Data: '2026-07-01',
        Fixa: true, Dia_Vencimento: 5
      })

      const registros = Renda.bulkCreate.mock.calls[0][0]
      expect(registros[0].Data).toBe('2026-07-05')
      expect(registros[5].Data).toBe('2026-12-05')
      expect(registros[6].Data).toBe('2027-01-05')
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar renda quando encontrada', async () => {
      Renda.findByPk.mockResolvedValue({ Id_Renda: '1', Descricao_Renda: 'Salário' })

      const result = await rendaService.buscarPorId('1')
      expect(result.Id_Renda).toBe('1')
    })

    it('deve lançar erro 404 quando renda não encontrada', async () => {
      Renda.findByPk.mockResolvedValue(null)

      await expect(rendaService.buscarPorId('999')).rejects.toMatchObject({
        message: 'Renda não encontrada',
        statusCode: 404
      })
    })
  })

  describe('_buildWhereClause', () => {
    it('deve filtrar por mes e ano corretamente', () => {
      const where = rendaService._buildWhereClause('u1', { mes: 7, ano: 2026 })
      expect(where.Id_Usuario).toBe('u1')
      expect(where.Data).toBeDefined()
    })

    it('deve filtrar por dataInicio e dataFim', () => {
      const where = rendaService._buildWhereClause('u1', {
        dataInicio: '2026-07-01', dataFim: '2026-07-31'
      })
      expect(where.Data).toBeDefined()
    })

    it('deve retornar apenas Id_Usuario quando sem filtros', () => {
      const where = rendaService._buildWhereClause('u1', {})
      expect(where).toEqual({ Id_Usuario: 'u1' })
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar lista de rendas do usuario', async () => {
      Renda.findAll.mockResolvedValue([{ Id_Renda: '1' }, { Id_Renda: '2' }])

      const result = await rendaService.listarPorUsuario('u1', { mes: 7, ano: 2026 })
      expect(result).toHaveLength(2)
      expect(Renda.findAll).toHaveBeenCalledTimes(1)
    })

    it('deve retornar lista vazia quando nao ha rendas', async () => {
      Renda.findAll.mockResolvedValue([])

      const result = await rendaService.listarPorUsuario('u1', {})
      expect(result).toHaveLength(0)
    })
  })

  describe('calcularTotalPorPeriodo', () => {
    it('deve retornar total de rendas do periodo', async () => {
      Renda.findOne.mockResolvedValue({ total: '3000.00' })

      const result = await rendaService.calcularTotalPorPeriodo('u1', { mes: 7, ano: 2026 })
      expect(result).toBe(3000)
    })

    it('deve retornar 0 quando nao ha rendas', async () => {
      Renda.findOne.mockResolvedValue({ total: null })

      const result = await rendaService.calcularTotalPorPeriodo('u1', { mes: 7, ano: 2026 })
      expect(result).toBe(0)
    })
  })

  describe('atualizar', () => {
    it('deve atualizar renda avulsa', async () => {
      const renda = {
        Id_Renda: '1', Fixa: false, Id_Usuario: 'u1',
        update: jest.fn().mockResolvedValue(true)
      }
      Renda.findByPk.mockResolvedValue(renda)

      const result = await rendaService.atualizar('1', { Descricao_Renda: 'Atualizado' })
      expect(renda.update).toHaveBeenCalledTimes(1)
      expect(result).toBe(renda)
    })

    it('deve atualizar todas as rendas fixas futuras quando atualizarTodas=true', async () => {
      const renda = {
        Id_Renda: '1', Fixa: true, Id_Usuario: 'u1',
        Descricao_Renda: 'Salário', Dia_Vencimento: 5, Data: '2026-07-05',
        update: jest.fn().mockResolvedValue(true)
      }
      Renda.findByPk.mockResolvedValue(renda)
      Renda.findAll.mockResolvedValue([renda])

      await rendaService.atualizar('1', { Descricao_Renda: 'Novo', atualizarTodas: true })
      expect(Renda.findAll).toHaveBeenCalledTimes(1)
      expect(renda.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('deletar', () => {
    it('deve deletar renda avulsa', async () => {
      const renda = {
        Id_Renda: '1', Fixa: false, Id_Usuario: 'u1',
        destroy: jest.fn().mockResolvedValue(true)
      }
      Renda.findByPk.mockResolvedValue(renda)

      const result = await rendaService.deletar('1', false)
      expect(renda.destroy).toHaveBeenCalledTimes(1)
      expect(result.mensagem).toBe('Renda deletada com sucesso')
    })

    it('deve deletar todas as rendas fixas futuras', async () => {
      const renda = {
        Id_Renda: '1', Fixa: true, Id_Usuario: 'u1',
        Descricao_Renda: 'Salário', Dia_Vencimento: 5, Data: '2026-07-05',
        destroy: jest.fn()
      }
      Renda.findByPk.mockResolvedValue(renda)
      Renda.destroy.mockResolvedValue(3)

      const result = await rendaService.deletar('1', true)
      expect(Renda.destroy).toHaveBeenCalledTimes(1)
      expect(result.mensagem).toBe('Rendas fixas deletadas com sucesso')
    })

    it('deve lançar erro quando renda nao encontrada', async () => {
      Renda.findByPk.mockResolvedValue(null)

      await expect(rendaService.deletar('999')).rejects.toMatchObject({
        statusCode: 404
      })
    })
  })
})
