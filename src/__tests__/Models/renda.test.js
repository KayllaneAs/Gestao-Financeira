import { DataTypes } from 'sequelize'
import defineRenda from '../../models/renda.js'

describe('Model Renda', () => {
  let sequelize
  let Renda
  let attributes
  let options

  beforeEach(() => {
    jest.clearAllMocks()

    Renda = {
      belongsTo: jest.fn()
    }

    sequelize = {
      define: jest.fn().mockReturnValue(Renda)
    }

    defineRenda(sequelize)

    const chamada = sequelize.define.mock.calls[0]
    attributes = chamada[1]
    options = chamada[2]
  })

  describe('definicao do model', () => {
    it('deve definir o model Renda', () => {
      expect(sequelize.define).toHaveBeenCalledTimes(1)
      expect(sequelize.define.mock.calls[0][0]).toBe('Renda')
    })

    it('deve utilizar a tabela renda', () => {
      expect(options.tableName).toBe('renda')
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
      expect(attributes).toHaveProperty('Id_Renda')
      expect(attributes).toHaveProperty('Id_Usuario')
      expect(attributes).toHaveProperty('Descricao_Renda')
      expect(attributes).toHaveProperty('Valor_Renda')
      expect(attributes).toHaveProperty('Data')
      expect(attributes).toHaveProperty('Fixa')
      expect(attributes).toHaveProperty('Dia_Vencimento')
    })

    it('deve definir Id_Renda como UUID e chave primaria', () => {
      expect(attributes.Id_Renda.type.key).toBe('UUID')
      expect(attributes.Id_Renda.defaultValue).toBe(DataTypes.UUIDV4)
      expect(attributes.Id_Renda.primaryKey).toBe(true)
    })

    it('deve exigir Id_Usuario', () => {
      expect(attributes.Id_Usuario.allowNull).toBe(false)

      expect(attributes.Id_Usuario.references).toEqual({
        model: 'usuario',
        key: 'id_usuario'
      })
    })

    it('deve exigir Descricao_Renda', () => {
      expect(attributes.Descricao_Renda.allowNull).toBe(false)
      expect(attributes.Descricao_Renda.type.key).toBe('STRING')
    })

    it('deve exigir Valor_Renda', () => {
      expect(attributes.Valor_Renda.allowNull).toBe(false)
      expect(attributes.Valor_Renda.type.key).toBe('DECIMAL')
    })

    it('deve exigir Data', () => {
      expect(attributes.Data.allowNull).toBe(false)
      expect(attributes.Data.type.key).toBe('DATEONLY')
    })

    it('deve definir Fixa como BOOLEAN', () => {
      expect(attributes.Fixa.type.key).toBe('BOOLEAN')
    })

    it('deve permitir Dia_Vencimento nulo', () => {
      expect(attributes.Dia_Vencimento.allowNull).toBe(true)
      expect(attributes.Dia_Vencimento.type.key).toBe('INTEGER')
    })
  })

  describe('validacoes e valores padrao', () => {
    it('deve impedir renda negativa', () => {
      expect(attributes.Valor_Renda.validate.min).toBe(0)
    })

    it('deve possuir Fixa false como padrao', () => {
      expect(attributes.Fixa.defaultValue).toBe(false)
    })
  })

  describe('indices', () => {
    it('deve possuir indice de usuario e data', () => {
      expect(options.indexes).toEqual(
        expect.arrayContaining([
          {
            name: 'idx_renda_usuario_data',
            fields: ['id_usuario', 'data']
          }
        ])
      )
    })

    it('deve possuir indice de usuario e renda fixa', () => {
      expect(options.indexes).toEqual(
        expect.arrayContaining([
          {
            name: 'idx_renda_usuario_fixa',
            fields: ['id_usuario', 'fixa']
          }
        ])
      )
    })
  })

  describe('associacoes', () => {
    it('deve pertencer a Usuario', () => {
      const models = {
        Usuario: {}
      }

      Renda.associate(models)

      expect(Renda.belongsTo).toHaveBeenCalledWith(
        models.Usuario,
        {
          foreignKey: 'Id_Usuario',
          as: 'usuario',
          onDelete: 'CASCADE'
        }
      )
    })
  })
})