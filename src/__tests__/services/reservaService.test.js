jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Reserva: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn()
    }
  }
}))

import reservaService from '@/services/reservaService.js'
import models from '@/models/index.js'

const { Reserva } = models

describe('ReservaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('criar', () => {
    it('deve criar uma reserva', async () => {
      const dados = {
        Id_Reserva: 'r1',
        Id_Usuario: 'u1',
        Nome_Objetivo: 'Viagem',
        Valor_Alvo: 5000,
        Valor_Atual: 1000
      }

      const reserva = { ...dados }

      Reserva.create.mockResolvedValue(reserva)

      const result = await reservaService.criar(dados)

      expect(Reserva.create).toHaveBeenCalledWith(dados)
      expect(result).toEqual(reserva)
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar a reserva encontrada', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Nome_Objetivo: 'Viagem',
        Valor_Alvo: 5000,
        Valor_Atual: 1000
      }

      Reserva.findByPk.mockResolvedValue(reserva)

      const result = await reservaService.buscarPorId('r1')

      expect(Reserva.findByPk).toHaveBeenCalledWith('r1')
      expect(result).toEqual(reserva)
    })

    it('deve lançar erro quando a reserva não existir', async () => {
      Reserva.findByPk.mockResolvedValue(null)

      await expect(
        reservaService.buscarPorId('inexistente')
      ).rejects.toThrow('Reserva não encontrada')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve listar reservas e calcular o progresso corretamente', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Id_Usuario: 'u1',
        Nome_Objetivo: 'Viagem',
        Valor_Alvo: '5000',
        Valor_Atual: '1000',
        toJSON: jest.fn().mockReturnValue({
          Id_Reserva: 'r1',
          Id_Usuario: 'u1',
          Nome_Objetivo: 'Viagem',
          Valor_Alvo: '5000',
          Valor_Atual: '1000'
        })
      }

      Reserva.findAll.mockResolvedValue([reserva])

      const result = await reservaService.listarPorUsuario('u1')

      expect(Reserva.findAll).toHaveBeenCalledWith({
        where: { Id_Usuario: 'u1' },
        order: [['Nome_Objetivo', 'ASC']]
      })

      expect(result).toHaveLength(1)
      expect(result[0].progresso).toBe('20.00')
    })

    it('deve limitar o progresso a 100 por cento', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Nome_Objetivo: 'Reserva completa',
        Valor_Alvo: '1000',
        Valor_Atual: '1500',
        toJSON: jest.fn().mockReturnValue({
          Id_Reserva: 'r1',
          Nome_Objetivo: 'Reserva completa',
          Valor_Alvo: '1000',
          Valor_Atual: '1500'
        })
      }

      Reserva.findAll.mockResolvedValue([reserva])

      const result = await reservaService.listarPorUsuario('u1')

      expect(result[0].progresso).toBe('100.00')
    })

    it('deve retornar lista vazia quando não houver reservas', async () => {
      Reserva.findAll.mockResolvedValue([])

      const result = await reservaService.listarPorUsuario('u1')

      expect(result).toEqual([])
    })
  })

  describe('atualizar', () => {
    it('deve atualizar uma reserva existente', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Nome_Objetivo: 'Viagem',
        update: jest.fn().mockResolvedValue(undefined)
      }

      jest.spyOn(reservaService, 'buscarPorId')
        .mockResolvedValue(reserva)

      const dados = {
        Nome_Objetivo: 'Viagem Internacional'
      }

      const result = await reservaService.atualizar('r1', dados)

      expect(reserva.update).toHaveBeenCalledWith(dados)
      expect(result).toBe(reserva)
    })
  })

  describe('adicionarValor', () => {
    it('deve adicionar valor ao saldo atual da reserva', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Valor_Atual: '1000',
        update: jest.fn().mockResolvedValue(undefined)
      }

      jest.spyOn(reservaService, 'buscarPorId')
        .mockResolvedValue(reserva)

      const result = await reservaService.adicionarValor('r1', '500')

      expect(reserva.update).toHaveBeenCalledWith({
        Valor_Atual: 1500
      })

      expect(result).toBe(reserva)
    })
  })

  describe('retirarValor', () => {
    it('deve retirar valor quando houver saldo suficiente', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Valor_Atual: '1000',
        update: jest.fn().mockResolvedValue(undefined)
      }

      jest.spyOn(reservaService, 'buscarPorId')
        .mockResolvedValue(reserva)

      const result = await reservaService.retirarValor('r1', '300')

      expect(reserva.update).toHaveBeenCalledWith({
        Valor_Atual: 700
      })

      expect(result).toBe(reserva)
    })

    it('deve lançar erro quando o valor for maior que o saldo', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        Valor_Atual: '500',
        update: jest.fn()
      }

      jest.spyOn(reservaService, 'buscarPorId')
        .mockResolvedValue(reserva)

      await expect(
        reservaService.retirarValor('r1', '600')
      ).rejects.toThrow('Valor insuficiente na reserva')

      expect(reserva.update).not.toHaveBeenCalled()
    })
  })

  describe('deletar', () => {
    it('deve deletar uma reserva existente', async () => {
      const reserva = {
        Id_Reserva: 'r1',
        destroy: jest.fn().mockResolvedValue(undefined)
      }

      jest.spyOn(reservaService, 'buscarPorId')
        .mockResolvedValue(reserva)

      const result = await reservaService.deletar('r1')

      expect(reserva.destroy).toHaveBeenCalled()
      expect(result).toEqual({
        mensagem: 'Reserva deletada com sucesso'
      })
    })
  })
})
