jest.mock('@/services/parcelamentoAgrupadorService.js', () => ({
  __esModule: true,
  default: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    calcularDividasFuturas: jest.fn(),
    cronogramaPagamentos: jest.fn(),
    faturaPorCartao: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
  }
}))

import parcelamentoAgrupadorController from '@/controllers/parcelamentoAgrupadorController.js'
import parcelamentoAgrupadorService from '@/services/parcelamentoAgrupadorService.js'

describe('ParcelamentoAgrupadorController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve retornar 201 com parcelamento criado', async () => {
      parcelamentoAgrupadorService.criar.mockResolvedValue({ Id_Parcelamento: '1', Descricao_Parcela: 'TV' })
      const result = await parcelamentoAgrupadorController.criar({ Descricao_Parcela: 'TV', Valor_Total: 3000, Qtd_Parcelas: 12 })
      expect(result.status).toBe(201)
      expect(result.data.Descricao_Parcela).toBe('TV')
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar 200 com o parcelamento encontrado', async () => {
      parcelamentoAgrupadorService.buscarPorId.mockResolvedValue({ Id_Parcelamento: '1' })
      const result = await parcelamentoAgrupadorController.buscarPorId('1')
      expect(result.status).toBe(200)
      expect(result.data.Id_Parcelamento).toBe('1')
    })

    it('deve lançar erro quando parcelamento não encontrado', async () => {
      parcelamentoAgrupadorService.buscarPorId.mockRejectedValue(new Error('Parcelamento não encontrado'))
      await expect(parcelamentoAgrupadorController.buscarPorId('999')).rejects.toThrow('Parcelamento não encontrado')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar 200 com lista de parcelamentos', async () => {
      parcelamentoAgrupadorService.listarPorUsuario.mockResolvedValue([{ Id_Parcelamento: '1' }, { Id_Parcelamento: '2' }])
      const result = await parcelamentoAgrupadorController.listarPorUsuario('user-1')
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('dividasFuturas', () => {
    it('deve retornar 200 com dívidas futuras', async () => {
      parcelamentoAgrupadorService.calcularDividasFuturas.mockResolvedValue({ total: 5000, parcelamentos: [] })
      const result = await parcelamentoAgrupadorController.dividasFuturas('user-1')
      expect(result.status).toBe(200)
      expect(result.data.total).toBe(5000)
    })
  })

  describe('cronograma', () => {
    it('deve retornar 200 com cronograma de pagamentos', async () => {
      parcelamentoAgrupadorService.cronogramaPagamentos.mockResolvedValue([{ mes: 6, total: 1000 }])
      const result = await parcelamentoAgrupadorController.cronograma('user-1')
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('faturaPorCartao', () => {
    it('deve retornar 400 se mes ou ano estiverem ausentes', async () => {
      const result = await parcelamentoAgrupadorController.faturaPorCartao('user-1', null, null)
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com fatura do cartão', async () => {
      parcelamentoAgrupadorService.faturaPorCartao.mockResolvedValue([{ Id_Conta: '1', total: 500 }])
      const result = await parcelamentoAgrupadorController.faturaPorCartao('user-1', '6', '2026')
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('atualizar', () => {
    it('deve retornar 200 com parcelamento atualizado', async () => {
      parcelamentoAgrupadorService.atualizar.mockResolvedValue({ Id_Parcelamento: '1', Descricao_Parcela: 'Geladeira' })
      const result = await parcelamentoAgrupadorController.atualizar('1', { Descricao_Parcela: 'Geladeira' })
      expect(result.status).toBe(200)
      expect(result.data.Descricao_Parcela).toBe('Geladeira')
    })
  })

  describe('deletar', () => {
    it('deve retornar 200 com mensagem de sucesso', async () => {
      parcelamentoAgrupadorService.deletar.mockResolvedValue({ mensagem: 'Parcelamento deletado com sucesso' })
      const result = await parcelamentoAgrupadorController.deletar('1')
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

})