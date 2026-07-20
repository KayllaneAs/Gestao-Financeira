import dashboardService from '@/services/dashboardService.js'

class DashboardController {
  async resumoMensal(idUsuario, mes, ano) {
    if (!mes || !ano) {
      return { status: 400, error: 'Mês e ano são obrigatórios' }
    }
    const resumo = await dashboardService.resumoMensal(idUsuario, parseInt(mes), parseInt(ano))
    return { status: 200, data: resumo }
  }

  async relatorioAnual(idUsuario, ano) {
    if (!ano) {
      return { status: 400, error: 'Ano é obrigatório' }
    }
    const relatorio = await dashboardService.relatorioAnual(idUsuario, parseInt(ano))
    return { status: 200, data: relatorio }
  }

  async exportarRelatorioAnualCSV(idUsuario, ano) {
    if (!ano) {
      return { status: 400, error: 'Ano é obrigatório' }
    }
    const csv = await dashboardService.exportarRelatorioAnualCSV(idUsuario, parseInt(ano))
    return { status: 200, data: csv, isCSV: true }
  }
}

export default new DashboardController()
