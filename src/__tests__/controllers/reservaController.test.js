jest.mock('@/services/reservaService.js', () => ({
  __esModule: true,
  default: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    adicionarValor: jest.fn(),
    retirarValor: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
  }
}))

import reservaController from '@/controllers/reservaController.js'
import reservaService from '@/services/reservaService.js'

describe('ReservaController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve retornar 201 com a reserva criada', async () => {
      reservaService.criar.mockResolvedValue({ Id_Reserva: '1', Nome_Objetivo: 'Viagem' })
      const result = await reservaController.criar({ Nome_Objetivo: 'Viagem', Valor_Alvo: 5000 })
      expect(result.status).toBe(201)
      expect(result.data.Nome_Objetivo).toBe('Viagem')
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar 200 com a reserva encontrada', async () => {
      reservaService.buscarPorId.mockResolvedValue({ Id_Reserva: '1', Nome_Objetivo: 'Viagem' })
      const result = await reservaController.buscarPorId('1')
      expect(result.status).toBe(200)
      expect(result.data.Id_Reserva).toBe('1')
    })

    it('deve lançar erro quando reserva não encontrada', async () => {
      reservaService.buscarPorId.mockRejectedValue(new Error('Reserva não encontrada'))
      await expect(reservaController.buscarPorId('999')).rejects.toThrow('Reserva não encontrada')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar 200 com lista de reservas', async () => {
      reservaService.listarPorUsuario.mockResolvedValue([{ Id_Reserva: '1' }, { Id_Reserva: '2' }])
      const result = await reservaController.listarPorUsuario('user-1')
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('adicionarValor', () => {
    it('deve retornar 400 se valor for ausente ou zero', async () => {
      const result = await reservaController.adicionarValor('1', { valor: 0 })
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 400 se valor for negativo', async () => {
      const result = await reservaController.adicionarValor('1', { valor: -100 })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 com reserva atualizada', async () => {
      reservaService.adicionarValor.mockResolvedValue({ Id_Reserva: '1', Valor_Atual: 500 })
      const result = await reservaController.adicionarValor('1', { valor: 500 })
      expect(result.status).toBe(200)
      expect(result.data.Valor_Atual).toBe(500)
    })
  })

  describe('retirarValor', () => {
    it('deve retornar 400 se valor for ausente ou zero', async () => {
      const result = await reservaController.retirarValor('1', { valor: 0 })
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 400 se valor for negativo', async () => {
      const result = await reservaController.retirarValor('1', { valor: -100 })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 com reserva atualizada', async () => {
      reservaService.retirarValor.mockResolvedValue({ Id_Reserva: '1', Valor_Atual: 0 })
      const result = await reservaController.retirarValor('1', { valor: 500 })
      expect(result.status).toBe(200)
      expect(result.data.Valor_Atual).toBe(0)
    })
  })

  describe('atualizar', () => {
    it('deve retornar 200 com reserva atualizada', async () => {
      reservaService.atualizar.mockResolvedValue({ Id_Reserva: '1', Nome_Objetivo: 'Carro' })
      const result = await reservaController.atualizar('1', { Nome_Objetivo: 'Carro' })
      expect(result.status).toBe(200)
      expect(result.data.Nome_Objetivo).toBe('Carro')
    })
  })

  describe('deletar', () => {
    it('deve retornar 200 com mensagem de sucesso', async () => {
      reservaService.deletar.mockResolvedValue({ mensagem: 'Reserva deletada com sucesso' })
      const result = await reservaController.deletar('1')
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

})