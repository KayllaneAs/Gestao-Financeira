jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    ParcelamentoAgrupador: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn()
    },
    Despesa: {
      findAll: jest.fn(),
      destroy: jest.fn()
    },
    ContaCartao: {
      findAll: jest.fn()
    }
  }
}))

import parcelamentoService from '@/services/parcelamentoAgrupadorService.js'
import models from '@/models/index.js'

const { ParcelamentoAgrupador, Despesa, ContaCartao } = models

describe('ParcelamentoAgrupadorService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('criar', () => {
    it('deve criar um parcelamento', async () => {
      const dados = {
        Id_Parcelamento: 'p1',
        Id_Usuario: 'u1',
        Descricao_Parcela: 'Notebook',
        Valor_Total: 3000,
        Qtd_Parcelas: 10
      }

      const parcelamento = { ...dados }

      ParcelamentoAgrupador.create.mockResolvedValue(parcelamento)

      const result = await parcelamentoService.criar(dados)

      expect(ParcelamentoAgrupador.create).toHaveBeenCalledWith(dados)
      expect(result).toEqual(parcelamento)
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar o parcelamento encontrado', async () => {
      const parcelamento = {
        Id_Parcelamento: 'p1',
        Descricao_Parcela: 'Notebook'
      }

      ParcelamentoAgrupador.findByPk.mockResolvedValue(parcelamento)

      const result = await parcelamentoService.buscarPorId('p1')

      expect(ParcelamentoAgrupador.findByPk).toHaveBeenCalled()
      expect(result).toEqual(parcelamento)
    })

    it('deve lançar erro quando o parcelamento não existir', async () => {
      ParcelamentoAgrupador.findByPk.mockResolvedValue(null)

      await expect(
        parcelamentoService.buscarPorId('inexistente')
      ).rejects.toMatchObject({
        message: 'Parcelamento não encontrado',
        statusCode: 404
      })
    })
  })

  describe('listarPorUsuario', () => {
    it('deve listar parcelamentos e calcular parcelas pagas e restantes', async () => {
      const hoje = new Date().toISOString().split('T')[0]

      const parcelamento = {
        Id_Parcelamento: 'p1',
        Id_Usuario: 'u1',
        Qtd_Parcelas: 10,
        Valor_Total: 1000,
        Data_Inicio: '2026-01-01',
        despesas: [
          { Data: '2026-01-01' },
          { Data: hoje },
          { Data: '2099-01-01' }
        ],
        toJSON: jest.fn(function () {
          return {
            Id_Parcelamento: this.Id_Parcelamento,
            Id_Usuario: this.Id_Usuario,
            Qtd_Parcelas: this.Qtd_Parcelas,
            Valor_Total: this.Valor_Total,
            Data_Inicio: this.Data_Inicio,
            despesas: this.despesas
          }
        })
      }

      ParcelamentoAgrupador.findAll.mockResolvedValue([parcelamento])

      const result = await parcelamentoService.listarPorUsuario('u1')

      expect(ParcelamentoAgrupador.findAll).toHaveBeenCalled()
      expect(result).toHaveLength(1)
      expect(result[0].parcelas_pagas).toBe(2)
      expect(result[0].parcelas_restantes).toBe(8)
      expect(result[0].valor_restante).toBe(800)
    })

    it('deve retornar lista vazia quando não houver parcelamentos', async () => {
      ParcelamentoAgrupador.findAll.mockResolvedValue([])

      const result = await parcelamentoService.listarPorUsuario('u1')

      expect(result).toEqual([])
    })
  })

  describe('calcularDividasFuturas', () => {
    it('deve calcular o total das dívidas futuras', async () => {
      Despesa.findAll.mockResolvedValue([
        { Valor_Parcela: '100.50' },
        { Valor_Parcela: '200.25' },
        { Valor_Parcela: '99.25' }
      ])

      const result = await parcelamentoService.calcularDividasFuturas('u1')

      expect(Despesa.findAll).toHaveBeenCalled()
      expect(result).toBe(400)
    })

    it('deve retornar zero quando não houver dívidas futuras', async () => {
      Despesa.findAll.mockResolvedValue([])

      const result = await parcelamentoService.calcularDividasFuturas('u1')

      expect(result).toBe(0)
    })
  })

  describe('cronogramaPagamentos', () => {
    it('deve agrupar despesas futuras por mês', async () => {
      Despesa.findAll.mockResolvedValue([
        {
          Data: '2099-01-10',
          Valor_Parcela: '100',
          Numero_Parcela: 1,
          Descricao_Despesa: 'Compra',
          parcelamento: {
            Descricao_Parcela: 'Notebook'
          }
        },
        {
          Data: '2099-01-20',
          Valor_Parcela: '150.50',
          Numero_Parcela: 2,
          Descricao_Despesa: 'Compra',
          parcelamento: {
            Descricao_Parcela: 'Notebook'
          }
        },
        {
          Data: '2099-02-10',
          Valor_Parcela: '200',
          Numero_Parcela: 3,
          Descricao_Despesa: 'Celular',
          parcelamento: null
        }
      ])

      const result = await parcelamentoService.cronogramaPagamentos('u1')

      expect(result).toHaveLength(2)

      expect(result[0].mes).toBe('2099-01')
      expect(result[0].total).toBe(250.5)
      expect(result[0].parcelas).toHaveLength(2)

      expect(result[1].mes).toBe('2099-02')
      expect(result[1].total).toBe(200)
      expect(result[1].parcelas[0].descricao).toBe('Celular')
    })

    it('deve retornar lista vazia quando não houver pagamentos futuros', async () => {
      Despesa.findAll.mockResolvedValue([])

      const result = await parcelamentoService.cronogramaPagamentos('u1')

      expect(result).toEqual([])
    })
  })

  describe('faturaPorCartao', () => {
    it('deve calcular as faturas dos cartões com despesas', async () => {
      ContaCartao.findAll.mockResolvedValue([
        {
          Id_Conta: 'c1',
          Nome_Conta: 'Nubank',
          Tipo: 'cartao',
          Cor_Hex: '#000000',
          Ultimos_Digitos: '1234'
        },
        {
          Id_Conta: 'c2',
          Nome_Conta: 'Inter',
          Tipo: 'cartao',
          Cor_Hex: '#FFFFFF',
          Ultimos_Digitos: '5678'
        }
      ])

      Despesa.findAll
        .mockResolvedValueOnce([
          {
            Id_Despesa: 'd1',
            Descricao_Despesa: 'Notebook',
            Valor_Parcela: '500',
            Data: '2026-07-10',
            Categoria: 'Eletrônicos',
            Numero_Parcela: 2,
            parcelamento: {
              Descricao_Parcela: 'Notebook',
              Qtd_Parcelas: 10
            }
          },
          {
            Id_Despesa: 'd2',
            Descricao_Despesa: 'Mercado',
            Valor_Parcela: '200',
            Data: '2026-07-15',
            Categoria: 'Alimentação',
            Numero_Parcela: 1,
            parcelamento: null
          }
        ])
        .mockResolvedValueOnce([])

      const result = await parcelamentoService.faturaPorCartao(
        'u1',
        7,
        2026
      )

      expect(result).toHaveLength(1)
      expect(result[0].conta.Nome_Conta).toBe('Nubank')
      expect(result[0].total_fatura).toBe(700)
      expect(result[0].quantidade_itens).toBe(2)
      expect(result[0].despesas).toHaveLength(2)
      expect(result[0].despesas[0].parcela_info).toBe('2/10')
      expect(result[0].despesas[1].parcela_info).toBe('À vista')
    })

    it('deve ignorar cartões sem despesas no período', async () => {
      ContaCartao.findAll.mockResolvedValue([
        {
          Id_Conta: 'c1',
          Nome_Conta: 'Nubank',
          Tipo: 'cartao'
        }
      ])

      Despesa.findAll.mockResolvedValue([])

      const result = await parcelamentoService.faturaPorCartao(
        'u1',
        7,
        2026
      )

      expect(result).toEqual([])
    })
  })

  describe('atualizar', () => {
    it('deve atualizar um parcelamento existente', async () => {
      const parcelamento = {
        Id_Parcelamento: 'p1',
        Descricao_Parcela: 'Notebook',
        update: jest.fn().mockResolvedValue(undefined)
      }

      jest.spyOn(parcelamentoService, 'buscarPorId')
        .mockResolvedValue(parcelamento)

      const dados = {
        Descricao_Parcela: 'Notebook Dell'
      }

      const result = await parcelamentoService.atualizar('p1', dados)

      expect(parcelamento.update).toHaveBeenCalledWith(dados)
      expect(result).toBe(parcelamento)
    })
  })

  describe('deletar', () => {
    it('deve deletar um parcelamento existente', async () => {
      const parcelamento = {
        Id_Parcelamento: 'p1',
        destroy: jest.fn().mockResolvedValue(undefined)
      }

      jest.spyOn(parcelamentoService, 'buscarPorId')
        .mockResolvedValue(parcelamento)

      const result = await parcelamentoService.deletar('p1')

      expect(parcelamento.destroy).toHaveBeenCalled()
      expect(result).toEqual({
        mensagem: 'Parcelamento e todas as parcelas deletados com sucesso'
      })
    })
  })
})
