import { DataTypes } from 'sequelize'
import defineDespesa from '../../models/Despesa.js'

describe('Model Despesa', () => {
  let sequelize
  let Despesa
  let attributes
  let options

  beforeEach(() => {
    jest.clearAllMocks()

    Despesa = {
      belongsTo: jest.fn()
    }

    sequelize = {
      define: jest.fn().mockReturnValue(Despesa)
    }

    defineDespesa(sequelize)

    const chamada = sequelize.define.mock.calls[0]
    attributes = chamada[1]
    options = chamada[2]
  })

  describe('definicao do model', () => {
    it('deve definir o model Despesa', () => {
      expect(sequelize.define).toHaveBeenCalledTimes(1)
      expect(sequelize.define.mock.calls[0][0]).toBe('Despesa')
    })

    it('deve utilizar a tabela despesa', () => {
      expect(options.tableName).toBe('despesa')
    })

    it('nao deve utilizar timestamps', () => {
      expect(options.timestamps).toBe(false)
    })

    it('deve utilizar underscored', () => {
      expect(options.underscored).toBe(true)
    })
  })

  describe('definicao dos campos', () => {
    it('deve possuir todos os campos esperados', () => {
      expect(attributes).toHaveProperty('Id_Despesa')
      expect(attributes).toHaveProperty('Id_Usuario')
      expect(attributes).toHaveProperty('Id_Conta')
      expect(attributes).toHaveProperty('Id_Parcelamento')
      expect(attributes).toHaveProperty('Descricao_Despesa')
      expect(attributes).toHaveProperty('Valor_Parcela')
      expect(attributes).toHaveProperty('Data')
      expect(attributes).toHaveProperty('Categoria')
      expect(attributes).toHaveProperty('Numero_Parcela')
    })

    it('deve definir Id_Despesa como UUID e chave primaria', () => {
      expect(attributes.Id_Despesa.type.key).toBe('UUID')
      expect(attributes.Id_Despesa.defaultValue).toBe(DataTypes.UUIDV4)
      expect(attributes.Id_Despesa.primaryKey).toBe(true)
    })

    it('deve exigir Id_Usuario', () => {
      expect(attributes.Id_Usuario.allowNull).toBe(false)

      expect(attributes.Id_Usuario.references).toEqual({
        model: 'usuario',
        key: 'id_usuario'
      })
    })

    it('deve exigir Id_Conta', () => {
      expect(attributes.Id_Conta.allowNull).toBe(false)

      expect(attributes.Id_Conta.references).toEqual({
        model: 'conta_cartao',
        key: 'id_conta'
      })
    })

    it('deve permitir Id_Parcelamento nulo', () => {
      expect(attributes.Id_Parcelamento.allowNull).toBe(true)

      expect(attributes.Id_Parcelamento.references).toEqual({
        model: 'parcelamento_agrupador',
        key: 'id_parcelamento'
      })
    })

    it('deve exigir Descricao_Despesa', () => {
      expect(attributes.Descricao_Despesa.allowNull).toBe(false)
      expect(attributes.Descricao_Despesa.type.key).toBe('STRING')
    })

    it('deve exigir Valor_Parcela', () => {
      expect(attributes.Valor_Parcela.allowNull).toBe(false)
      expect(attributes.Valor_Parcela.type.key).toBe('DECIMAL')
    })

    it('deve exigir Data', () => {
      expect(attributes.Data.allowNull).toBe(false)
      expect(attributes.Data.type.key).toBe('DATEONLY')
    })

    it('deve exigir Categoria', () => {
      expect(attributes.Categoria.allowNull).toBe(false)
      expect(attributes.Categoria.type.key).toBe('STRING')
    })
  })

  describe('validacoes e valores padrao', () => {
    it('deve impedir Valor_Parcela negativo', () => {
      expect(attributes.Valor_Parcela.validate.min).toBe(0)
    })

    it('deve possuir Numero_Parcela igual a 1 por padrao', () => {
      expect(attributes.Numero_Parcela.defaultValue).toBe(1)
    })

    it('deve impedir Numero_Parcela menor que 1', () => {
      expect(attributes.Numero_Parcela.validate.min).toBe(1)
    })
  })

  describe('indices', () => {
    it('deve possuir os indices configurados', () => {
      expect(options.indexes).toEqual(
        expect.arrayContaining([
          {
            name: 'idx_despesa_usuario_data',
            fields: ['id_usuario', 'data']
          },
          {
            name: 'idx_despesa_usuario_categoria',
            fields: ['id_usuario', 'categoria']
          },
          {
            name: 'idx_despesa_conta_data',
            fields: ['id_conta', 'data']
          },
          {
            name: 'idx_despesa_parcelamento',
            fields: ['id_parcelamento']
          }
        ])
      )
    })
  })

  describe('associacoes', () => {
    it('deve possuir associacao com Usuario', () => {
      const models = {
        Usuario: {},
        ContaCartao: {},
        ParcelamentoAgrupador: {}
      }

      Despesa.associate(models)

      expect(Despesa.belongsTo).toHaveBeenCalledWith(
        models.Usuario,
        {
          foreignKey: 'Id_Usuario',
          as: 'usuario',
          onDelete: 'CASCADE'
        }
      )
    })

    it('deve possuir associacao com ContaCartao', () => {
      const models = {
        Usuario: {},
        ContaCartao: {},
        ParcelamentoAgrupador: {}
      }

      Despesa.associate(models)

      expect(Despesa.belongsTo).toHaveBeenCalledWith(
        models.ContaCartao,
        {
          foreignKey: 'Id_Conta',
          as: 'conta'
        }
      )
    })

    it('deve possuir associacao com ParcelamentoAgrupador', () => {
      const models = {
        Usuario: {},
        ContaCartao: {},
        ParcelamentoAgrupador: {}
      }

      Despesa.associate(models)

      expect(Despesa.belongsTo).toHaveBeenCalledWith(
        models.ParcelamentoAgrupador,
        {
          foreignKey: 'Id_Parcelamento',
          as: 'parcelamento',
          onDelete: 'CASCADE'
        }
      )
    })
  })
})