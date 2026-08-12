import { DataTypes } from 'sequelize'
import defineContaCartao from '../../models/ContaCartao.js'

describe('Model ContaCartao', () => {
  let sequelize
  let ContaCartao
  let attributes
  let options

  beforeEach(() => {
    jest.clearAllMocks()

    ContaCartao = {
      belongsTo: jest.fn(),
      hasMany: jest.fn()
    }

    sequelize = {
      define: jest.fn().mockReturnValue(ContaCartao)
    }

    defineContaCartao(sequelize)

    const chamada = sequelize.define.mock.calls[0]
    attributes = chamada[1]
    options = chamada[2]
  })

  describe('definicao do model', () => {
    it('deve definir o model ContaCartao', () => {
      expect(sequelize.define).toHaveBeenCalledTimes(1)
      expect(sequelize.define.mock.calls[0][0]).toBe('ContaCartao')
    })

    it('deve utilizar a tabela conta_cartao', () => {
      expect(options.tableName).toBe('conta_cartao')
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
      expect(attributes).toHaveProperty('Id_Conta')
      expect(attributes).toHaveProperty('Id_Usuario')
      expect(attributes).toHaveProperty('Nome_Conta')
      expect(attributes).toHaveProperty('Tipo')
      expect(attributes).toHaveProperty('Titular')
      expect(attributes).toHaveProperty('Ultimos_Digitos')
      expect(attributes).toHaveProperty('Cor_Hex')
    })

    it('deve definir Id_Conta como UUID e chave primaria', () => {
      expect(attributes.Id_Conta.type.key).toBe('UUID')
      expect(attributes.Id_Conta.defaultValue).toBe(DataTypes.UUIDV4)
      expect(attributes.Id_Conta.primaryKey).toBe(true)
      expect(attributes.Id_Conta.field).toBe('id_conta')
    })

    it('deve exigir Id_Usuario', () => {
      expect(attributes.Id_Usuario.type.key).toBe('UUID')
      expect(attributes.Id_Usuario.allowNull).toBe(false)
      expect(attributes.Id_Usuario.field).toBe('id_usuario')
    })

    it('deve possuir referencia de Id_Usuario para usuario', () => {
      expect(attributes.Id_Usuario.references).toEqual({
        model: 'usuario',
        key: 'id_usuario'
      })
    })

    it('deve exigir Nome_Conta', () => {
      expect(attributes.Nome_Conta.type.key).toBe('STRING')
      expect(attributes.Nome_Conta.allowNull).toBe(false)
    })

    it('deve exigir Tipo', () => {
      expect(attributes.Tipo.allowNull).toBe(false)
    })

    it('deve exigir Titular', () => {
      expect(attributes.Titular.allowNull).toBe(false)
    })

    it('deve permitir Ultimos_Digitos nulo', () => {
      expect(attributes.Ultimos_Digitos.allowNull).toBe(true)
      expect(attributes.Ultimos_Digitos.type.key).toBe('CHAR')
    })

    it('deve exigir Cor_Hex', () => {
      expect(attributes.Cor_Hex.allowNull).toBe(false)
      expect(attributes.Cor_Hex.type.key).toBe('CHAR')
    })
  })

  describe('validacoes', () => {
    it('deve permitir apenas tipos de conta validos', () => {
      expect(attributes.Tipo.validate.isIn).toEqual([
        ['Corrente', 'Crédito', 'Dinheiro']
      ])
    })

    it('deve validar cor hexadecimal', () => {
      expect(attributes.Cor_Hex.validate.is).toEqual(
        /^#[0-9A-F]{6}$/i
      )
    })
  })

  describe('indices', () => {
    it('deve possuir indice para usuario', () => {
      expect(options.indexes).toEqual(
        expect.arrayContaining([
          {
            name: 'idx_conta_usuario',
            fields: ['id_usuario']
          }
        ])
      )
    })
  })

  describe('associacoes', () => {
    it('deve pertencer a Usuario', () => {
      const models = {
        Usuario: {},
        Despesa: null
      }

      ContaCartao.associate(models)

      expect(ContaCartao.belongsTo).toHaveBeenCalledWith(
        models.Usuario,
        {
          foreignKey: 'Id_Usuario',
          as: 'usuario',
          onDelete: 'CASCADE'
        }
      )
    })

    it('deve possuir varias despesas quando Despesa existir', () => {
      const models = {
        Usuario: {},
        Despesa: {}
      }

      ContaCartao.associate(models)

      expect(ContaCartao.hasMany).toHaveBeenCalledWith(
        models.Despesa,
        {
          foreignKey: 'Id_Conta',
          as: 'despesas'
        }
      )
    })

    it('nao deve criar hasMany quando Despesa nao existir', () => {
      const models = {
        Usuario: {},
        Despesa: null
      }

      ContaCartao.associate(models)

      expect(ContaCartao.hasMany).not.toHaveBeenCalled()
    })
  })
})