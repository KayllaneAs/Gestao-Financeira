jest.mock('@/services/dashboardService.js', () => ({
  __esModule: true,
  default: {
    resumoMensal: jest.fn(),
    relatorioAnual: jest.fn(),
    exportarRelatorioAnualCSV: jest.fn(),
  }
}))

import dashboardController from '@/controllers/dashboardController.js'
import dashboardService from '@/services/dashboardService.js'

describe('DashboardController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('resumoMensal', () => {
    it('deve retornar 400 se mes ou ano estiverem ausentes', async () => {
      const result = await dashboardController.resumoMensal('user-1', null, null)
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com o resumo mensal', async () => {
      dashboardService.resumoMensal.mockResolvedValue({ totalRendas: 3000, totalDespesas: 1500, saldo: 1500 })
      const result = await dashboardController.resumoMensal('user-1', '6', '2026')
      expect(result.status).toBe(200)
      expect(result.data.saldo).toBe(1500)
    })
  })

  describe('relatorioAnual', () => {
    it('deve retornar 400 se ano estiver ausente', async () => {
      const result = await dashboardController.relatorioAnual('user-1', null)
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com o relatório anual', async () => {
      dashboardService.relatorioAnual.mockResolvedValue({ ano: 2026, meses: [] })
      const result = await dashboardController.relatorioAnual('user-1', '2026')
      expect(result.status).toBe(200)
      expect(result.data.ano).toBe(2026)
    })
  })

  describe('exportarRelatorioAnualCSV', () => {
    it('deve retornar 400 se ano estiver ausente', async () => {
      const result = await dashboardController.exportarRelatorioAnualCSV('user-1', null)
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com CSV e flag isCSV', async () => {
      dashboardService.exportarRelatorioAnualCSV.mockResolvedValue('csv;data')
      const result = await dashboardController.exportarRelatorioAnualCSV('user-1', '2026')
      expect(result.status).toBe(200)
      expect(result.isCSV).toBe(true)
      expect(result.data).toBe('csv;data')
    })
  })

})