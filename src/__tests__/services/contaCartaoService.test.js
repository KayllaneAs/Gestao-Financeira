jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    ContaCartao: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    }
  }
}))

import contaCartaoService from '@/services/contaCartaoService.js'
import models from '@/models/index.js'

const { ContaCartao } = models

const mockConta = {
  Id_Conta: 'c1',
  Id_Usuario: 'u1',
  Nome_Conta: 'Inter',
  Tipo: 'Crédito',
  Cor_Hex: '#f97316',
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
}

describe('ContaCartaoService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve criar conta com sucesso', async () => {
      ContaCartao.create.mockResolvedValue(mockConta)

      const result = await contaCartaoService.criar({
        Id_Usuario: 'u1', Nome_Conta: 'Inter',
        Tipo: 'Crédito', Cor_Hex: '#f97316'
      })

      expect(ContaCartao.create).toHaveBeenCalledTimes(1)
      expect(result.Nome_Conta).toBe('Inter')
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar conta quando encontrada', async () => {
      ContaCartao.findByPk.mockResolvedValue(mockConta)

      const result = await contaCartaoService.buscarPorId('c1')
      expect(result.Id_Conta).toBe('c1')
    })

    it('deve lançar erro quando conta nao encontrada', async () => {
      ContaCartao.findByPk.mockResolvedValue(null)

      await expect(contaCartaoService.buscarPorId('999'))
        .rejects.toThrow('Conta/Cartão não encontrado')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar todas as contas do usuario', async () => {
      ContaCartao.findAll.mockResolvedValue([mockConta, mockConta])

      const result = await contaCartaoService.listarPorUsuario('u1')
      expect(result).toHaveLength(2)
      expect(ContaCartao.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { Id_Usuario: 'u1' } })
      )
    })

    it('deve filtrar por tipo quando informado', async () => {
      ContaCartao.findAll.mockResolvedValue([mockConta])

      await contaCartaoService.listarPorUsuario('u1', 'Crédito')
      expect(ContaCartao.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { Id_Usuario: 'u1', Tipo: 'Crédito' } })
      )
    })

    it('deve retornar lista vazia quando nao ha contas', async () => {
      ContaCartao.findAll.mockResolvedValue([])

      const result = await contaCartaoService.listarPorUsuario('u1')
      expect(result).toHaveLength(0)
    })
  })

  describe('atualizar', () => {
    it('deve atualizar conta com sucesso', async () => {
      ContaCartao.findByPk.mockResolvedValue(mockConta)

      const result = await contaCartaoService.atualizar('c1', { Nome_Conta: 'Nubank' })
      expect(mockConta.update).toHaveBeenCalledWith({ Nome_Conta: 'Nubank' })
      expect(result).toBe(mockConta)
    })

    it('deve lançar erro ao atualizar conta inexistente', async () => {
      ContaCartao.findByPk.mockResolvedValue(null)

      await expect(contaCartaoService.atualizar('999', { Nome_Conta: 'X' }))
        .rejects.toThrow('Conta/Cartão não encontrado')
    })
  })

  describe('deletar', () => {
    it('deve deletar conta com sucesso', async () => {
      ContaCartao.findByPk.mockResolvedValue(mockConta)

      const result = await contaCartaoService.deletar('c1')
      expect(mockConta.destroy).toHaveBeenCalledTimes(1)
      expect(result.mensagem).toBe('Conta/Cartão deletado com sucesso')
    })

    it('deve lançar erro ao deletar conta inexistente', async () => {
      ContaCartao.findByPk.mockResolvedValue(null)

      await expect(contaCartaoService.deletar('999'))
        .rejects.toThrow('Conta/Cartão não encontrado')
    })
  })
})
