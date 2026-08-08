jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Despesa: {
      create: jest.fn(),
      destroy: jest.fn()
    },
    ContaCartao: {
      findOne: jest.fn()
    },
    ParcelamentoAgrupador: {
      create: jest.fn(),
      destroy: jest.fn()
    },
    sequelize: {
      transaction: jest.fn()
    }
  }
}))

jest.mock('@/services/categorizacaoService.js', () => ({
  __esModule: true,
  default: {
    sugerirCategoria: jest.fn()
  }
}))

jest.mock('@/services/cacheService.js', () => ({
  __esModule: true,
  default: {
    invalidateUser: jest.fn()
  }
}))

import importacaoService from '@/services/importacaoService.js'
import models from '@/models/index.js'
import categorizacaoService from '@/services/categorizacaoService.js'
import cacheService from '@/services/cacheService.js'

const {
  Despesa,
  ContaCartao,
  ParcelamentoAgrupador,
  sequelize
} = models

describe('ImportacaoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    categorizacaoService.sugerirCategoria.mockImplementation(
      (descricao) => {
        const texto = String(descricao).toLowerCase()

        if (texto.includes('mercado')) return 'Alimentação'
        if (texto.includes('uber')) return 'Transporte'
        if (texto.includes('netflix')) return 'Entretenimento'

        return null
      }
    )
  })

  describe('parsearPreview', () => {
    it('deve detectar separador ponto e virgula', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;150,50',
        '02/07/2026;Uber;25,00'
      ].join('\n')

      const result = importacaoService.parsearPreview(csv)

      expect(result.separador).toBe(';')
      expect(result.cabecalho).toEqual([
        'Data',
        'Descrição',
        'Valor'
      ])
      expect(result.totalLinhas).toBe(2)
    })

    it('deve detectar separador virgula', () => {
      const csv = [
        'Data,Descrição,Valor',
        '01/07/2026,Mercado,150.50'
      ].join('\n')

      const result = importacaoService.parsearPreview(csv)

      expect(result.separador).toBe(',')
      expect(result.cabecalho).toEqual([
        'Data',
        'Descrição',
        'Valor'
      ])
    })

    it('deve retornar amostra das primeiras linhas', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;100',
        '02/07/2026;Uber;20',
        '03/07/2026;Netflix;40',
        '04/07/2026;Padaria;30'
      ].join('\n')

      const result = importacaoService.parsearPreview(csv)

      expect(result.amostra).toHaveLength(3)
      expect(result.amostra[0]).toEqual([
        '01/07/2026',
        'Mercado',
        '100'
      ])
    })

    it('deve detectar automaticamente as colunas', () => {
      const csv = [
        'Data,Descrição,Valor',
        '01/07/2026,Mercado,100'
      ].join('\n')

      const result = importacaoService.parsearPreview(csv)

      expect(result.sugestao).toEqual({
        colData: 0,
        colDesc: 1,
        colValor: 2
      })
    })

    it('deve usar colunas padrão quando não conseguir detectar', () => {
      const csv = [
        'ColunaA,ColunaB,ColunaC',
        'a,b,c'
      ].join('\n')

      const result = importacaoService.parsearPreview(csv)

      expect(result.sugestao).toEqual({
        colData: 0,
        colDesc: 1,
        colValor: 2
      })
    })

    it('deve rejeitar CSV com menos de duas linhas', () => {
      const csv = 'Data;Descrição;Valor'

      expect(() => {
        importacaoService.parsearPreview(csv)
      }).toThrow('CSV deve ter pelo menos 2 linhas')
    })
  })

  describe('processarCSV', () => {
    it('deve processar transação válida', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;150,50'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes).toHaveLength(1)
      expect(result.transacoes[0].descricao).toBe('Mercado')
      expect(result.transacoes[0].data).toBe('2026-07-01')
      expect(result.transacoes[0].valor).toBe(150.50)
      expect(result.transacoes[0].categoria).toBe('Alimentação')
      expect(result.transacoes[0].ehParcelamento).toBe(false)

      expect(result.erros).toHaveLength(0)
      expect(result.resumo.total).toBe(1)
      expect(result.resumo.avulsas).toBe(1)
    })

    it('deve converter valores brasileiros corretamente', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;R$ 1.234,56'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes[0].valor).toBe(1234.56)
    })

    it('deve aceitar valores negativos e armazenar valor absoluto', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;-100,50'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes[0].valor).toBe(100.50)
    })

    it('deve ignorar valores negativos quando ignorarNegativo estiver ativo', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;-100,50',
        '02/07/2026;Uber;50,00'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2,
        ignorarNegativo: true
      })

      expect(result.transacoes).toHaveLength(1)
      expect(result.transacoes[0].descricao).toBe('Uber')
    })

    it('deve ignorar valores iguais a zero', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;0',
        '02/07/2026;Uber;50'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes).toHaveLength(1)
      expect(result.transacoes[0].descricao).toBe('Uber')
    })

    it('deve registrar erro para data inválida', () => {
      const csv = [
        'Data;Descrição;Valor',
        'data-invalida;Mercado;100'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes).toHaveLength(0)
      expect(result.erros).toHaveLength(1)
      expect(result.erros[0].linha).toBe(2)
      expect(result.erros[0].motivo).toContain('Data inválida')
    })

    it('deve registrar erro para valor inválido', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;abc'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes).toHaveLength(0)
      expect(result.erros).toHaveLength(1)
      expect(result.erros[0].motivo).toContain('Valor inválido')
    })

    it('deve registrar erro para descrição vazia', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;;100'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes).toHaveLength(0)
      expect(result.erros).toHaveLength(1)
      expect(result.erros[0].motivo).toBe('Descrição vazia')
    })

    it('deve classificar como Outros quando não houver sugestão', () => {
      categorizacaoService.sugerirCategoria.mockReturnValue(null)

      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Compra desconhecida;100'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes[0].categoria).toBe('Outros')
      expect(result.transacoes[0].categoriaSugerida).toBe(false)
    })

    it('deve detectar parcelamento no formato X/Y', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Notebook Dell 05/12;300'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      const transacao = result.transacoes[0]

      expect(transacao.ehParcelamento).toBe(true)
      expect(transacao.parcela).toEqual({
        atual: 5,
        total: 12,
        descBase: 'Notebook Dell'
      })
      expect(transacao.descricaoBase).toBe('Notebook Dell')
    })

    it('deve detectar parcelamento com texto Parcela', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Compra Mercado - Parcela 2/6;100'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.transacoes[0].parcela).toEqual({
        atual: 2,
        total: 6,
        descBase: 'Compra Mercado'
      })
    })

    it('deve agrupar parcelas com mesma descrição e total', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/05/2026;Notebook Dell 1/12;100',
        '01/06/2026;Notebook Dell 2/12;100'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.grupos).toHaveLength(1)
      expect(result.grupos[0].descricao).toBe('Notebook Dell')
      expect(result.grupos[0].totalParcelas).toBe(12)
      expect(result.grupos[0].valorParcela).toBe(100)
      expect(result.grupos[0].valorTotal).toBe(1200)
      expect(result.grupos[0].parcelas).toHaveLength(2)
    })

    it('deve calcular data de início do parcelamento', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/05/2026;Notebook Dell 5/12;100'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.grupos[0].dataInicio).toBe('2026-01-01')
    })

    it('deve calcular corretamente o resumo da importação', () => {
      const csv = [
        'Data;Descrição;Valor',
        '01/07/2026;Mercado;100',
        '02/07/2026;Uber;50',
        '03/07/2026;Notebook 1/3;200'
      ].join('\n')

      const result = importacaoService.processarCSV(csv, {
        colData: 0,
        colDesc: 1,
        colValor: 2
      })

      expect(result.resumo.total).toBe(3)
      expect(result.resumo.parcelamentos).toBe(1)
      expect(result.resumo.avulsas).toBe(2)
    })
  })

  describe('confirmarImportacao', () => {
    beforeEach(() => {
      ContaCartao.findOne.mockResolvedValue({
        Id_Conta: 'c1',
        Id_Usuario: 'u1'
      })

      sequelize.transaction.mockResolvedValue({
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue()
      })

      ParcelamentoAgrupador.create.mockResolvedValue({})
      Despesa.create.mockResolvedValue({})
    })

    it('deve rejeitar quando a conta não existe', async () => {
      ContaCartao.findOne.mockResolvedValue(null)

      await expect(
        importacaoService.confirmarImportacao({
          idUsuario: 'u1',
          idConta: 'c1',
          transacoes: [],
          grupos: []
        })
      ).rejects.toMatchObject({
        message: 'Conta não encontrada',
        statusCode: 404
      })

      expect(sequelize.transaction).not.toHaveBeenCalled()
    })

    it('deve criar despesas avulsas', async () => {
      const transaction = await sequelize.transaction()

      const transacoes = [
        {
          descricao: 'Mercado',
          valor: 150,
          data: '2026-07-01',
          categoria: 'Alimentação',
          ehParcelamento: false
        }
      ]

      const result = await importacaoService.confirmarImportacao({
        idUsuario: 'u1',
        idConta: 'c1',
        transacoes,
        grupos: []
      })

      expect(Despesa.create).toHaveBeenCalledTimes(1)

      expect(Despesa.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Id_Usuario: 'u1',
          Id_Conta: 'c1',
          Descricao_Despesa: 'Mercado',
          Valor_Parcela: 150,
          Data: '2026-07-01',
          Categoria: 'Alimentação',
          Numero_Parcela: 1
        }),
        { transaction }
      )

      expect(result.despesasAvulsas).toBe(1)
      expect(result.despesasCriadas).toBe(1)
      expect(result.parcelamentosCriados).toBe(0)
      expect(transaction.commit).toHaveBeenCalled()
      expect(cacheService.invalidateUser).toHaveBeenCalledWith('u1')
    })

    it('deve criar parcelamento e todas as parcelas', async () => {
      const grupo = {
        descricao: 'Notebook Dell',
        categoria: 'Eletrônicos',
        valorParcela: 100,
        valorTotal: 300,
        dataInicio: '2026-07-01',
        totalParcelas: 3,
        parcelaAtual: 1
      }

      const result = await importacaoService.confirmarImportacao({
        idUsuario: 'u1',
        idConta: 'c1',
        transacoes: [],
        grupos: [grupo]
      })

      expect(ParcelamentoAgrupador.create).toHaveBeenCalledTimes(1)
      expect(Despesa.create).toHaveBeenCalledTimes(3)

      expect(result.parcelamentosCriados).toBe(1)
      expect(result.despesasCriadas).toBe(3)

      expect(Despesa.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Id_Usuario: 'u1',
          Id_Conta: 'c1',
          Id_Parcelamento: expect.any(String),
          Descricao_Despesa: 'Notebook Dell',
          Valor_Parcela: 100,
          Categoria: 'Eletrônicos',
          Numero_Parcela: 1
        }),
        expect.any(Object)
      )

      expect(result.idsParcelamentos).toHaveLength(1)
      expect(cacheService.invalidateUser).toHaveBeenCalledWith('u1')
    })

    it('deve contabilizar transações sem categoria sugerida', async () => {
      const transacoes = [
        {
          descricao: 'Compra',
          valor: 50,
          data: '2026-07-01',
          categoria: 'Outros',
          ehParcelamento: false
        },
        {
          descricao: 'Mercado',
          valor: 100,
          data: '2026-07-02',
          categoria: 'Alimentação',
          ehParcelamento: false
        }
      ]

      const result = await importacaoService.confirmarImportacao({
        idUsuario: 'u1',
        idConta: 'c1',
        transacoes,
        grupos: []
      })

      expect(result.semCategoriaSugerida).toBe(1)
      expect(result.mensagem).toContain('1 transação(ões)')
      expect(result.mensagem).toContain('Outros')
    })

    it('deve informar que todas as transações foram categorizadas', async () => {
      const transacoes = [
        {
          descricao: 'Mercado',
          valor: 100,
          data: '2026-07-01',
          categoria: 'Alimentação',
          ehParcelamento: false
        }
      ]

      const result = await importacaoService.confirmarImportacao({
        idUsuario: 'u1',
        idConta: 'c1',
        transacoes,
        grupos: []
      })

      expect(result.semCategoriaSugerida).toBe(0)
      expect(result.mensagem).toContain(
        'todas as transações categorizadas'
      )
    })

    it('deve fazer rollback quando ocorrer erro', async () => {
      const transaction = await sequelize.transaction()

      Despesa.create.mockRejectedValueOnce(
        new Error('Erro ao criar despesa')
      )

      const transacoes = [
        {
          descricao: 'Mercado',
          valor: 100,
          data: '2026-07-01',
          categoria: 'Alimentação',
          ehParcelamento: false
        }
      ]

      await expect(
        importacaoService.confirmarImportacao({
          idUsuario: 'u1',
          idConta: 'c1',
          transacoes,
          grupos: []
        })
      ).rejects.toThrow('Erro ao criar despesa')

      expect(transaction.rollback).toHaveBeenCalled()
      expect(transaction.commit).not.toHaveBeenCalled()
      expect(cacheService.invalidateUser).not.toHaveBeenCalled()
    })
  })

  describe('desfazerImportacao', () => {
    beforeEach(() => {
      sequelize.transaction.mockResolvedValue({
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue()
      })

      ParcelamentoAgrupador.destroy.mockResolvedValue(2)
      Despesa.destroy.mockResolvedValue(1)
    })

    it('deve desfazer parcelamentos e despesas avulsas', async () => {
      const transaction = await sequelize.transaction()

      const result = await importacaoService.desfazerImportacao({
        idUsuario: 'u1',
        idsParcelamentos: ['p1', 'p2'],
        idsDespesasAvulsas: ['d1']
      })

      expect(ParcelamentoAgrupador.destroy).toHaveBeenCalledTimes(1)
      expect(Despesa.destroy).toHaveBeenCalledTimes(1)

      expect(transaction.commit).toHaveBeenCalled()
      expect(transaction.rollback).not.toHaveBeenCalled()

      expect(cacheService.invalidateUser).toHaveBeenCalledWith('u1')

      expect(result).toEqual({
        mensagem: 'Importação desfeita com sucesso'
      })
    })

    it('não deve tentar deletar quando não houver IDs', async () => {
      const result = await importacaoService.desfazerImportacao({
        idUsuario: 'u1',
        idsParcelamentos: [],
        idsDespesasAvulsas: []
      })

      expect(ParcelamentoAgrupador.destroy).not.toHaveBeenCalled()
      expect(Despesa.destroy).not.toHaveBeenCalled()
      expect(cacheService.invalidateUser).toHaveBeenCalledWith('u1')

      expect(result.mensagem).toBe(
        'Importação desfeita com sucesso'
      )
    })

    it('deve fazer rollback quando ocorrer erro ao desfazer', async () => {
      const transaction = await sequelize.transaction()

      ParcelamentoAgrupador.destroy.mockRejectedValueOnce(
        new Error('Erro ao deletar parcelamento')
      )

      await expect(
        importacaoService.desfazerImportacao({
          idUsuario: 'u1',
          idsParcelamentos: ['p1'],
          idsDespesasAvulsas: []
        })
      ).rejects.toThrow('Erro ao deletar parcelamento')

      expect(transaction.rollback).toHaveBeenCalled()
      expect(transaction.commit).not.toHaveBeenCalled()
      expect(cacheService.invalidateUser).not.toHaveBeenCalled()
    })
  })
})
