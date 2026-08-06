jest.mock('@/services/importacaoService.js', () => ({
  __esModule: true,
  default: {
    parsearPreview: jest.fn(),
    processarCSV: jest.fn(),
    confirmarImportacao: jest.fn(),
    desfazerImportacao: jest.fn(),
  }
}))

import importacaoController from '@/controllers/importacaoController.js'
import importacaoService from '@/services/importacaoService.js'

describe('ImportacaoController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('preview', () => {
    it('deve retornar 400 se csv estiver ausente', async () => {
      const result = await importacaoController.preview({ csv: '' })
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 400 se csv não for string', async () => {
      const result = await importacaoController.preview({ csv: 123 })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 com preview do CSV', async () => {
      importacaoService.parsearPreview.mockReturnValue({ cabecalhos: ['data', 'desc', 'valor'], linhas: [] })
      const result = await importacaoController.preview({ csv: 'data;desc;valor\n2026-06-01;Mercado;100' })
      expect(result.status).toBe(200)
      expect(result.data.cabecalhos).toBeDefined()
    })
  })

  describe('processar', () => {
    it('deve retornar 400 se csv estiver ausente', async () => {
      const result = await importacaoController.processar({ csv: '', colData: 0, colDesc: 1, colValor: 2 })
      expect(result.status).toBe(400)
    })

    it('deve retornar 400 se colunas estiverem ausentes', async () => {
      const result = await importacaoController.processar({ csv: 'data;desc;valor', colData: undefined, colDesc: undefined, colValor: undefined })
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com transações processadas', async () => {
      importacaoService.processarCSV.mockReturnValue([{ descricao: 'Mercado', valor: 100 }])
      const result = await importacaoController.processar({ csv: 'data;desc;valor', colData: 0, colDesc: 1, colValor: 2 })
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('confirmar', () => {
    it('deve retornar 400 se idConta estiver ausente', async () => {
      const result = await importacaoController.confirmar({ idConta: '', transacoes: [{}] }, 'user-1')
      expect(result.status).toBe(400)
    })

    it('deve retornar 400 se não houver transações nem grupos', async () => {
      const result = await importacaoController.confirmar({ idConta: 'conta-1', transacoes: [], grupos: [] }, 'user-1')
      expect(result.status).toBe(400)
    })

    it('deve retornar 201 com resultado da importação', async () => {
      importacaoService.confirmarImportacao.mockResolvedValue({ importadas: 3 })
      const result = await importacaoController.confirmar({ idConta: 'conta-1', transacoes: [{}] }, 'user-1')
      expect(result.status).toBe(201)
      expect(result.data.importadas).toBe(3)
    })
  })

  describe('desfazer', () => {
    it('deve retornar 400 se nenhum ID for informado', async () => {
      const result = await importacaoController.desfazer({ idsParcelamentos: [], idsDespesasAvulsas: [] }, 'user-1')
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 ao desfazer importação com idsParcelamentos', async () => {
      importacaoService.desfazerImportacao.mockResolvedValue({ desfeitas: 2 })
      const result = await importacaoController.desfazer({ idsParcelamentos: ['id-1', 'id-2'], idsDespesasAvulsas: [] }, 'user-1')
      expect(result.status).toBe(200)
      expect(result.data.desfeitas).toBe(2)
    })

    it('deve retornar 200 ao desfazer importação com idsDespesasAvulsas', async () => {
      importacaoService.desfazerImportacao.mockResolvedValue({ desfeitas: 1 })
      const result = await importacaoController.desfazer({ idsParcelamentos: [], idsDespesasAvulsas: ['id-1'] }, 'user-1')
      expect(result.status).toBe(200)
      expect(result.data.desfeitas).toBe(1)
    })
  })

})