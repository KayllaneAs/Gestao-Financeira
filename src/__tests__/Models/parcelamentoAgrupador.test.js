import { DataTypes } from 'sequelize'
import defineParcelamentoAgrupador from '../../models/ParcelamentoAgrupador.js'

describe('Model ParcelamentoAgrupador', () => {
  let sequelize
  let ParcelamentoAgrupador
  let attributes
  let options

  beforeEach(() => {
    jest.clearAllMocks()

    ParcelamentoAgrupador = {
      belongsTo: jest.fn(),
      hasMany: jest.fn()
    }

    sequelize = {
      define: jest.fn().mockReturnValue(ParcelamentoAgrupador)
    }

    defineParcelamentoAgrupador(sequelize)

    const chamada = sequelize.define.mock.calls[0]
    attributes = chamada[1]
    options = chamada[2]
  })

  describe('definicao do model', () => {
    it('deve definir o model ParcelamentoAgrupador', () => {
      expect(sequelize.define).toHaveBeenCalledTimes(1)

      expect(
        sequelize.define.mock.calls[0][0]
      ).toBe('ParcelamentoAgrupador')
    })

    it('deve utilizar a tabela parcelamento_agrupador', () => {
      expect(options.tableName).toBe('parcelamento_agrupador')
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
      expect(attributes).toHaveProperty('Id_Parcelamento')
      expect(attributes).toHaveProperty('Id_Usuario')
      expect(attributes).toHaveProperty('Descricao_Parcela')
      expect(attributes).toHaveProperty('Valor_Total')
      expect(attributes).toHaveProperty('Qtd_Parcelas')
      expect(attributes).toHaveProperty('Data_Inicio')
    })

    it('deve definir Id_Parcelamento como UUID e chave primaria', () => {
      expect(attributes.Id_Parcelamento.type.key).toBe('UUID')

      expect(
        attributes.Id_Parcelamento.defaultValue
      ).toBe(DataTypes.UUIDV4)

      expect(attributes.Id_Parcelamento.primaryKey).toBe(true)
    })

    it('deve exigir Id_Usuario', () => {
      expect(attributes.Id_Usuario.allowNull).toBe(false)

      expect(attributes.Id_Usuario.references).toEqual({
        model: 'usuario',
        key: 'id_usuario'
      })
    })

    it('deve exigir Descricao_Parcela', () => {
      expect(attributes.Descricao_Parcela.allowNull).toBe(false)
      expect(attributes.Descricao_Parcela.type.key).toBe('STRING')
    })

    it('deve exigir Valor_Total', () => {
      expect(attributes.Valor_Total.allowNull).toBe(false)
      expect(attributes.Valor_Total.type.key).toBe('DECIMAL')
    })

    it('deve exigir Qtd_Parcelas', () => {
      expect(attributes.Qtd_Parcelas.allowNull).toBe(false)
      expect(attributes.Qtd_Parcelas.type.key).toBe('INTEGER')
    })

    it('deve exigir Data_Inicio', () => {
      expect(attributes.Data_Inicio.allowNull).toBe(false)
      expect(attributes.Data_Inicio.type.key).toBe('DATEONLY')
    })
  })

  describe('validacoes', () => {
    it('deve impedir Valor_Total negativo', () => {
      expect(attributes.Valor_Total.validate.min).toBe(0)
    })

    it('deve exigir pelo menos uma parcela', () => {
      expect(attributes.Qtd_Parcelas.validate.min).toBe(1)
    })
  })

  describe('associacoes', () => {
    it('deve pertencer a Usuario', () => {
      const models = {
        Usuario: {},
        Despesa: {}
      }

      ParcelamentoAgrupador.associate(models)

      expect(
        ParcelamentoAgrupador.belongsTo
      ).toHaveBeenCalledWith(
        models.Usuario,
        {
          foreignKey: 'Id_Usuario',
          as: 'usuario',
          onDelete: 'CASCADE'
        }
      )
    })

    it('deve possuir varias despesas', () => {
      const models = {
        Usuario: {},
        Despesa: {}
      }

      ParcelamentoAgrupador.associate(models)

      expect(
        ParcelamentoAgrupador.hasMany
      ).toHaveBeenCalledWith(
        models.Despesa,
        {
          foreignKey: 'Id_Parcelamento',
          as: 'despesas',
          onDelete: 'CASCADE'
        }
      )
    })
  })
})