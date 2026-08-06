jest.mock('@/services/contaCartaoService.js', () => ({
  __esModule: true,
  default: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
  }
}))

import contaCartaoController from '@/controllers/contaCartaoController.js'
import contaCartaoService from '@/services/contaCartaoService.js'

describe('ContaCartaoController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve lançar erro 400 se campos obrigatórios estiverem ausentes', async () => {
      await expect(contaCartaoController.criar({ Nome_Conta: '', Tipo: '', Titular: '', Cor_Hex: '', Id_Usuario: '' }))
        .rejects.toMatchObject({ status: 400 })
    })

    it('deve lançar erro 400 se tipo for inválido', async () => {
      await expect(contaCartaoController.criar({
        Nome_Conta: 'Nubank', Tipo: 'Invalido', Titular: 'Laura', Cor_Hex: '#6366f1', Id_Usuario: 'user-1'
      })).rejects.toMatchObject({ status: 400 })
    })

    it('deve lançar erro 400 se cor hex for inválida', async () => {
      await expect(contaCartaoController.criar({
        Nome_Conta: 'Nubank', Tipo: 'Crédito', Titular: 'Laura', Cor_Hex: 'invalida', Id_Usuario: 'user-1'
      })).rejects.toMatchObject({ status: 400 })
    })

    it('deve retornar 201 com conta criada quando dados são válidos', async () => {
      contaCartaoService.criar.mockResolvedValue({ Id_Conta: '1', Nome_Conta: 'Nubank' })
      const result = await contaCartaoController.criar({
        Nome_Conta: 'Nubank', Tipo: 'Corrente', Titular: 'Laura', Cor_Hex: '#6366f1', Id_Usuario: 'user-1'
      })
      expect(result.status).toBe(201)
      expect(result.data.Nome_Conta).toBe('Nubank')
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar 200 com a conta encontrada', async () => {
      contaCartaoService.buscarPorId.mockResolvedValue({ Id_Conta: '1', Nome_Conta: 'Nubank' })
      const result = await contaCartaoController.buscarPorId('1')
      expect(result.status).toBe(200)
      expect(result.data.Id_Conta).toBe('1')
    })

    it('deve lançar erro quando conta não encontrada', async () => {
      contaCartaoService.buscarPorId.mockRejectedValue(new Error('Conta não encontrada'))
      await expect(contaCartaoController.buscarPorId('999')).rejects.toThrow('Conta não encontrada')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar 200 com lista de contas', async () => {
      contaCartaoService.listarPorUsuario.mockResolvedValue([{ Id_Conta: '1' }, { Id_Conta: '2' }])
      const result = await contaCartaoController.listarPorUsuario('user-1', null)
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })

    it('deve retornar 200 com lista filtrada por tipo', async () => {
      contaCartaoService.listarPorUsuario.mockResolvedValue([{ Id_Conta: '1', Tipo: 'Crédito' }])
      const result = await contaCartaoController.listarPorUsuario('user-1', 'Crédito')
      expect(result.status).toBe(200)
      expect(result.data[0].Tipo).toBe('Crédito')
    })
  })

  describe('atualizar', () => {
    it('deve retornar 200 com conta atualizada', async () => {
      contaCartaoService.atualizar.mockResolvedValue({ Id_Conta: '1', Nome_Conta: 'Inter' })
      const result = await contaCartaoController.atualizar('1', { Nome_Conta: 'Inter' })
      expect(result.status).toBe(200)
      expect(result.data.Nome_Conta).toBe('Inter')
    })
  })

  describe('deletar', () => {
    it('deve retornar 200 com mensagem de sucesso', async () => {
      contaCartaoService.deletar.mockResolvedValue({ mensagem: 'Conta/Cartão deletado com sucesso' })
      const result = await contaCartaoController.deletar('1')
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

})