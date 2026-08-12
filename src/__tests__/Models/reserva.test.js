import { DataTypes } from 'sequelize'
import defineReserva from '../../models/Reserva.js'

describe('Model Reserva', () => {
  let sequelize
  let Reserva
  let attributes
  let options

  beforeEach(() => {
    jest.clearAllMocks()

    Reserva = {
      belongsTo: jest.fn()
    }

    sequelize = {
      define: jest.fn().mockReturnValue(Reserva)
    }

    defineReserva(sequelize)

    const chamada = sequelize.define.mock.calls[0]
    attributes = chamada[1]
    options = chamada[2]
  })

  describe('definicao do model', () => {
    it('deve definir o model Reserva', () => {
      expect(sequelize.define).toHaveBeenCalledTimes(1)
      expect(sequelize.define.mock.calls[0][0]).toBe('Reserva')
    })

    it('deve utilizar a tabela reserva', () => {
      expect(options.tableName).toBe('reserva')
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
      expect(attributes).toHaveProperty('Id_Reserva')
      expect(attributes).toHaveProperty('Id_Usuario')
      expect(attributes).toHaveProperty('Nome_Objetivo')
      expect(attributes).toHaveProperty('Valor_Alvo')
      expect(attributes).toHaveProperty('Valor_Atual')
      expect(attributes).toHaveProperty('Data_Limite')
    })

    it('deve definir Id_Reserva como UUID e chave primaria', () => {
      expect(attributes.Id_Reserva.type.key).toBe('UUID')
      expect(attributes.Id_Reserva.defaultValue).toBe(DataTypes.UUIDV4)
      expect(attributes.Id_Reserva.primaryKey).toBe(true)
    })

    it('deve exigir Id_Usuario', () => {
      expect(attributes.Id_Usuario.allowNull).toBe(false)

      expect(attributes.Id_Usuario.references).toEqual({
        model: 'usuario',
        key: 'id_usuario'
      })
    })

    it('deve exigir Nome_Objetivo', () => {
      expect(attributes.Nome_Objetivo.allowNull).toBe(false)
      expect(attributes.Nome_Objetivo.type.key).toBe('STRING')
    })

    it('deve exigir Valor_Alvo', () => {
      expect(attributes.Valor_Alvo.allowNull).toBe(false)
      expect(attributes.Valor_Alvo.type.key).toBe('DECIMAL')
    })

    it('deve definir Valor_Atual como DECIMAL', () => {
      expect(attributes.Valor_Atual.type.key).toBe('DECIMAL')
    })

    it('deve permitir Data_Limite nula', () => {
      expect(attributes.Data_Limite.allowNull).toBe(true)
      expect(attributes.Data_Limite.type.key).toBe('DATEONLY')
    })
  })

  describe('validacoes e valores padrao', () => {
    it('deve impedir Valor_Alvo negativo', () => {
      expect(attributes.Valor_Alvo.validate.min).toBe(0)
    })

    it('deve impedir Valor_Atual negativo', () => {
      expect(attributes.Valor_Atual.validate.min).toBe(0)
    })

    it('deve iniciar Valor_Atual com zero', () => {
      expect(attributes.Valor_Atual.defaultValue).toBe(0)
    })
  })

  describe('associacoes', () => {
    it('deve pertencer a Usuario', () => {
      const models = {
        Usuario: {}
      }

      Reserva.associate(models)

      expect(Reserva.belongsTo).toHaveBeenCalledWith(
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