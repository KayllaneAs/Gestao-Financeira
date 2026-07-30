jest.mock('@/services/rendaService.js', () => ({
  __esModule: true,
  default: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
  }
}))

import rendaController from '@/controllers/rendaController.js'
import rendaService from '@/services/rendaService.js'

describe('RendaController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve retornar 201 com a renda criada', async () => {
      rendaService.criar.mockResolvedValue({ Id_Renda: '1', Descricao_Renda: 'Salário' })
      const result = await rendaController.criar({ Descricao_Renda: 'Salário', Valor_Renda: 3000, Data: '2026-06-01' })
      expect(result.status).toBe(201)
      expect(result.data.Descricao_Renda).toBe('Salário')
    })

    it('deve retornar 201 com lista de rendas para renda fixa', async () => {
      rendaService.criar.mockResolvedValue([{ Id_Renda: '1' }, { Id_Renda: '2' }])
      const result = await rendaController.criar({ Descricao_Renda: 'Salário', Fixa: true, Dia_Vencimento: 5 })
      expect(result.status).toBe(201)
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar 200 com a renda encontrada', async () => {
      rendaService.buscarPorId.mockResolvedValue({ Id_Renda: '1', Descricao_Renda: 'Salário' })
      const result = await rendaController.buscarPorId('1')
      expect(result.status).toBe(200)
      expect(result.data.Id_Renda).toBe('1')
    })

    it('deve lançar erro quando renda não encontrada', async () => {
      rendaService.buscarPorId.mockRejectedValue(new Error('Renda não encontrada'))
      await expect(rendaController.buscarPorId('999')).rejects.toThrow('Renda não encontrada')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar 200 com lista de rendas', async () => {
      rendaService.listarPorUsuario.mockResolvedValue([{ Id_Renda: '1' }, { Id_Renda: '2' }])
      const result = await rendaController.listarPorUsuario('user-1', { mes: 6, ano: 2026 })
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })

    it('deve retornar 200 com lista vazia quando não há rendas', async () => {
      rendaService.listarPorUsuario.mockResolvedValue([])
      const result = await rendaController.listarPorUsuario('user-1', {})
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(0)
    })
  })

  describe('atualizar', () => {
    it('deve retornar 200 com renda atualizada', async () => {
      rendaService.atualizar.mockResolvedValue({ Id_Renda: '1', Descricao_Renda: 'Salário atualizado' })
      const result = await rendaController.atualizar('1', { Descricao_Renda: 'Salário atualizado' })
      expect(result.status).toBe(200)
      expect(result.data.Descricao_Renda).toBe('Salário atualizado')
    })
  })

  describe('deletar', () => {
    it('deve retornar 200 ao deletar renda avulsa', async () => {
      rendaService.deletar.mockResolvedValue({ mensagem: 'Renda deletada com sucesso' })
      const result = await rendaController.deletar('1', false)
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })

    it('deve retornar 200 ao deletar todas as rendas fixas', async () => {
      rendaService.deletar.mockResolvedValue({ mensagem: 'Rendas fixas deletadas com sucesso' })
      const result = await rendaController.deletar('1', true)
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

})