jest.mock('@/services/despesaService.js', () => ({
  __esModule: true,
  default: {
    criar: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    calcularTotalPorPeriodo: jest.fn(),
    calcularPorCategoria: jest.fn(),
    topDespesas: jest.fn(),
    exportarCSV: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
  }
}))

import despesaController from '@/controllers/despesaController.js'
import despesaService from '@/services/despesaService.js'

describe('DespesaController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('criar', () => {
    it('deve retornar 201 com despesa criada', async () => {
      despesaService.criar.mockResolvedValue({ Id_Despesa: '1', Descricao_Despesa: 'Mercado' })
      const result = await despesaController.criar({ Descricao_Despesa: 'Mercado', Valor_Total: 200 })
      expect(result.status).toBe(201)
      expect(result.data.Descricao_Despesa).toBe('Mercado')
    })

    it('deve retornar 201 com parcelamento quando parcelada', async () => {
      despesaService.criar.mockResolvedValue({ parcelamento: {}, despesas: [{}, {}, {}] })
      const result = await despesaController.criar({ Descricao_Despesa: 'TV', Numero_Parcelas: 3 })
      expect(result.status).toBe(201)
      expect(result.data.despesas).toHaveLength(3)
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar 200 com a despesa encontrada', async () => {
      despesaService.buscarPorId.mockResolvedValue({ Id_Despesa: '1', Descricao_Despesa: 'Mercado' })
      const result = await despesaController.buscarPorId('1')
      expect(result.status).toBe(200)
      expect(result.data.Id_Despesa).toBe('1')
    })

    it('deve lançar erro quando despesa não encontrada', async () => {
      despesaService.buscarPorId.mockRejectedValue(new Error('Despesa não encontrada'))
      await expect(despesaController.buscarPorId('999')).rejects.toThrow('Despesa não encontrada')
    })
  })

  describe('listarPorUsuario', () => {
    it('deve retornar 200 com lista de despesas', async () => {
      despesaService.listarPorUsuario.mockResolvedValue([{ Id_Despesa: '1' }, { Id_Despesa: '2' }])
      const result = await despesaController.listarPorUsuario('user-1', { mes: 6, ano: 2026 })
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('calcularTotal', () => {
    it('deve retornar 200 com o total calculado', async () => {
      despesaService.calcularTotalPorPeriodo.mockResolvedValue(1500.00)
      const result = await despesaController.calcularTotal('user-1', 6, 2026)
      expect(result.status).toBe(200)
      expect(result.data).toBe(1500.00)
    })
  })

  describe('calcularPorCategoria', () => {
    it('deve retornar 200 com totais por categoria', async () => {
      despesaService.calcularPorCategoria.mockResolvedValue([
        { categoria: 'Alimentação', total: 500 },
        { categoria: 'Transporte', total: 200 }
      ])
      const result = await despesaController.calcularPorCategoria('user-1', 6, 2026)
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('topDespesas', () => {
    it('deve retornar 200 com as top 5 despesas', async () => {
      despesaService.topDespesas.mockResolvedValue([{}, {}, {}, {}, {}])
      const result = await despesaController.topDespesas('user-1', 6, 2026, 5)
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(5)
    })
  })

  describe('exportarCSV', () => {
    it('deve retornar 200 com CSV e flag isCSV', async () => {
      despesaService.exportarCSV.mockResolvedValue('descricao;valor;data\n')
      const result = await despesaController.exportarCSV('user-1', 6, 2026)
      expect(result.status).toBe(200)
      expect(result.isCSV).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('atualizar', () => {
    it('deve retornar 200 com despesa atualizada', async () => {
      despesaService.atualizar.mockResolvedValue({ Id_Despesa: '1', Descricao_Despesa: 'Mercado atualizado' })
      const result = await despesaController.atualizar('1', { Descricao_Despesa: 'Mercado atualizado' })
      expect(result.status).toBe(200)
      expect(result.data.Descricao_Despesa).toBe('Mercado atualizado')
    })
  })

  describe('deletar', () => {
    it('deve retornar 200 ao deletar despesa avulsa', async () => {
      despesaService.deletar.mockResolvedValue({ mensagem: 'Despesa deletada com sucesso' })
      const result = await despesaController.deletar('1', false)
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })

    it('deve retornar 200 ao deletar parcelamento completo', async () => {
      despesaService.deletar.mockResolvedValue({ mensagem: 'Parcelamento deletado com sucesso' })
      const result = await despesaController.deletar('1', true)
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

})