import { DataTypes } from 'sequelize'
import defineUsuario from '../../models/usuario.js'

describe('Model Usuario', () => {
  let sequelize
  let Usuario
  let attributes
  let options

  beforeEach(() => {
    jest.clearAllMocks()

    Usuario = {
      belongsTo: jest.fn(),
      hasMany: jest.fn()
    }

    sequelize = {
      define: jest.fn().mockReturnValue(Usuario)
    }

    defineUsuario(sequelize)

    const chamada = sequelize.define.mock.calls[0]
    attributes = chamada[1]
    options = chamada[2]
  })

  describe('definicao do model', () => {
    it('deve definir o model Usuario', () => {
      expect(sequelize.define).toHaveBeenCalledTimes(1)
      expect(sequelize.define.mock.calls[0][0]).toBe('Usuario')
    })

    it('deve utilizar a tabela usuario', () => {
      expect(options.tableName).toBe('usuario')
    })

    it('nao deve utilizar timestamps', () => {
      expect(options.timestamps).toBe(false)
    })
  })

  describe('definicao dos campos', () => {
    it('deve possuir todos os campos esperados', () => {
      expect(attributes).toHaveProperty('Id_Usuario')
      expect(attributes).toHaveProperty('Nome')
      expect(attributes).toHaveProperty('Email')
      expect(attributes).toHaveProperty('Senha')
      expect(attributes).toHaveProperty('Cargo')
      expect(attributes).toHaveProperty('Codigo_Verificacao')
      expect(attributes).toHaveProperty('Codigo_Expiracao')
      expect(attributes).toHaveProperty('Email_Verificado')
      expect(attributes).toHaveProperty('Data_Criacao')
    })

    it('deve definir Id_Usuario como UUID e chave primaria', () => {
      expect(attributes.Id_Usuario.type.key).toBe('UUID')
      expect(attributes.Id_Usuario.defaultValue).toBe(DataTypes.UUIDV4)
      expect(attributes.Id_Usuario.primaryKey).toBe(true)
      expect(attributes.Id_Usuario.field).toBe('id_usuario')
    })

    it('deve definir Nome como obrigatorio', () => {
      expect(attributes.Nome.type.key).toBe('STRING')
      expect(attributes.Nome.allowNull).toBe(false)
      expect(attributes.Nome.field).toBe('nome')
    })

    it('deve definir Email como obrigatorio e unico', () => {
      expect(attributes.Email.type.key).toBe('STRING')
      expect(attributes.Email.allowNull).toBe(false)
      expect(attributes.Email.unique).toBe(true)
      expect(attributes.Email.field).toBe('email')
    })

    it('deve definir Senha como obrigatoria', () => {
      expect(attributes.Senha.type.key).toBe('STRING')
      expect(attributes.Senha.allowNull).toBe(false)
      expect(attributes.Senha.field).toBe('senha')
    })

    it('deve permitir Codigo_Verificacao nulo', () => {
      expect(attributes.Codigo_Verificacao.allowNull).toBe(true)
    })

    it('deve permitir Codigo_Expiracao nulo', () => {
      expect(attributes.Codigo_Expiracao.allowNull).toBe(true)
    })
  })

  describe('validacoes e valores padrao', () => {
    it('deve validar o formato do email', () => {
      expect(attributes.Email.validate).toEqual({
        isEmail: true
      })
    })

    it('deve possuir cargo usuario como padrao', () => {
      expect(attributes.Cargo.defaultValue).toBe('usuario')
      expect(attributes.Cargo.allowNull).toBe(false)
    })

    it('deve possuir Email_Verificado false como padrao', () => {
      expect(attributes.Email_Verificado.defaultValue).toBe(false)
      expect(attributes.Email_Verificado.allowNull).toBe(false)
    })

    it('deve possuir Data_Criacao com valor padrao NOW', () => {
      expect(attributes.Data_Criacao.defaultValue).toBe(DataTypes.NOW)
    })
  })

  describe('associacoes', () => {
    it('deve possuir funcao associate', () => {
      expect(typeof Usuario.associate).toBe('function')
    })
  })
})