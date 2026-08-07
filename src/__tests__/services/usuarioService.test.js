jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Usuario: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    }
  }
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_token'),
}))

jest.mock('@/config/env.js', () => ({
  __esModule: true,
  default: {
    jwt: { secret: 'test_secret', expiresIn: '7d' }
  }
}))

jest.mock('@/services/emailService.js', () => ({
  __esModule: true,
  default: {
    enviarCodigoVerificacao: jest.fn().mockResolvedValue(true),
    enviarCodigoResetSenha: jest.fn().mockResolvedValue(true),
  }
}))

import usuarioService from '@/services/usuarioService.js'
import models from '@/models/index.js'
import bcryptjs from 'bcryptjs'

const { Usuario } = models

describe('UsuarioService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('registrar', () => {
    it('deve registrar usuario e enviar OTP', async () => {
      Usuario.findOne.mockResolvedValue(null)
      Usuario.create.mockResolvedValue({})

      const result = await usuarioService.registrar({
        Nome: 'Guilherme', Email: 'gui@test.com', Senha: '123456'
      })

      expect(Usuario.create).toHaveBeenCalledTimes(1)
      expect(result.requiresVerification).toBe(true)
      expect(result.email).toBe('gui@test.com')
    })

    it('deve lançar erro 409 quando email ja cadastrado', async () => {
      Usuario.findOne.mockResolvedValue({ Email: 'gui@test.com' })

      await expect(usuarioService.registrar({ Email: 'gui@test.com', Senha: '123456' }))
        .rejects.toMatchObject({ statusCode: 409, message: 'Email já cadastrado' })
    })

    it('deve hashear a senha antes de salvar', async () => {
      Usuario.findOne.mockResolvedValue(null)
      Usuario.create.mockResolvedValue({})

      await usuarioService.registrar({ Nome: 'Gui', Email: 'gui@test.com', Senha: '123456' })

      expect(bcryptjs.hash).toHaveBeenCalledWith('123456', 10)
      const createCall = Usuario.create.mock.calls[0][0]
      expect(createCall.Senha).toBe('hashed_password')
    })
  })

  describe('verificarEmail', () => {
    it('deve verificar email com codigo valido', async () => {
      const futuro = new Date(Date.now() + 10 * 60 * 1000)
      const usuario = {
        Email_Verificado: false,
        Codigo_Verificacao: '123456',
        Codigo_Expiracao: futuro,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          Id_Usuario: 'u1', Nome: 'Gui', Email: 'gui@test.com',
          Cargo: 'usuario', Email_Verificado: true,
          Senha: 'hash', Codigo_Verificacao: null, Codigo_Expiracao: null
        })
      }
      Usuario.findOne.mockResolvedValue(usuario)

      const result = await usuarioService.verificarEmail('gui@test.com', '123456')
      expect(result.token).toBe('fake_token')
      expect(usuario.update).toHaveBeenCalledWith({
        Email_Verificado: true,
        Codigo_Verificacao: null,
        Codigo_Expiracao: null,
      })
    })

    it('deve lançar erro 400 quando codigo invalido', async () => {
      const usuario = {
        Email_Verificado: false,
        Codigo_Verificacao: '999999',
        Codigo_Expiracao: new Date(Date.now() + 10 * 60 * 1000),
      }
      Usuario.findOne.mockResolvedValue(usuario)

      await expect(usuarioService.verificarEmail('gui@test.com', '000000'))
        .rejects.toMatchObject({ statusCode: 400, message: 'Código inválido' })
    })

    it('deve lançar erro 400 quando codigo expirado', async () => {
      const passado = new Date(Date.now() - 1000)
      const usuario = {
        Email_Verificado: false,
        Codigo_Verificacao: '123456',
        Codigo_Expiracao: passado,
      }
      Usuario.findOne.mockResolvedValue(usuario)

      await expect(usuarioService.verificarEmail('gui@test.com', '123456'))
        .rejects.toMatchObject({ statusCode: 400 })
    })

    it('deve lançar erro 404 quando usuario nao encontrado', async () => {
      Usuario.findOne.mockResolvedValue(null)

      await expect(usuarioService.verificarEmail('nao@existe.com', '123456'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('reenviarCodigo', () => {
    it('deve reenviar codigo para email nao verificado', async () => {
      const usuario = {
        Email_Verificado: false,
        Email: 'gui@test.com',
        Nome: 'Gui',
        update: jest.fn().mockResolvedValue(true)
      }
      Usuario.findOne.mockResolvedValue(usuario)

      const result = await usuarioService.reenviarCodigo('gui@test.com')
      expect(result.mensagem).toBe('Novo código enviado para o seu e-mail.')
      expect(usuario.update).toHaveBeenCalledTimes(1)
    })

    it('deve retornar mensagem generica quando email nao existe', async () => {
      Usuario.findOne.mockResolvedValue(null)

      const result = await usuarioService.reenviarCodigo('nao@existe.com')
      expect(result.mensagem).toContain('Se o e-mail estiver cadastrado')
    })

    it('deve lançar erro 400 quando email ja verificado', async () => {
      Usuario.findOne.mockResolvedValue({ Email_Verificado: true })

      await expect(usuarioService.reenviarCodigo('gui@test.com'))
        .rejects.toMatchObject({ statusCode: 400 })
    })
  })

  describe('login', () => {
    it('deve retornar token para credenciais validas', async () => {
      const usuario = {
        Email_Verificado: true,
        Senha: 'hashed_password',
        toJSON: jest.fn().mockReturnValue({
          Id_Usuario: 'u1', Email: 'gui@test.com', Cargo: 'usuario',
          Senha: 'hash', Codigo_Verificacao: null, Codigo_Expiracao: null
        })
      }
      Usuario.findOne.mockResolvedValue(usuario)
      bcryptjs.compare.mockResolvedValue(true)

      const result = await usuarioService.login('gui@test.com', '123456')
      expect(result.token).toBe('fake_token')
      expect(result.usuario).toBeDefined()
    })

    it('deve lançar erro 401 quando email nao encontrado', async () => {
      Usuario.findOne.mockResolvedValue(null)

      await expect(usuarioService.login('nao@existe.com', '123456'))
        .rejects.toMatchObject({ statusCode: 401 })
    })

    it('deve lançar erro 401 quando senha invalida', async () => {
      Usuario.findOne.mockResolvedValue({ Senha: 'hash', Email_Verificado: true })
      bcryptjs.compare.mockResolvedValue(false)

      await expect(usuarioService.login('gui@test.com', 'errada'))
        .rejects.toMatchObject({ statusCode: 401 })
    })

    it('deve lançar erro 403 quando email nao verificado', async () => {
      Usuario.findOne.mockResolvedValue({
        Senha: 'hash', Email_Verificado: false, Email: 'gui@test.com'
      })
      bcryptjs.compare.mockResolvedValue(true)

      await expect(usuarioService.login('gui@test.com', '123456'))
        .rejects.toMatchObject({ statusCode: 403, requiresVerification: true })
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar usuario quando encontrado', async () => {
      Usuario.findByPk.mockResolvedValue({ Id_Usuario: 'u1', Nome: 'Gui' })

      const result = await usuarioService.buscarPorId('u1')
      expect(result.Id_Usuario).toBe('u1')
    })

    it('deve lançar erro 404 quando usuario nao encontrado', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(usuarioService.buscarPorId('999'))
        .rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('deletar', () => {
    it('deve deletar usuario com sucesso', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        destroy: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ Id_Usuario: 'u1' }),
        attributes: {}
      }
      Usuario.findByPk.mockResolvedValue(usuario)

      const result = await usuarioService.deletar('u1')
      expect(usuario.destroy).toHaveBeenCalledTimes(1)
      expect(result.mensagem).toBe('Usuário deletado com sucesso')
    })
  })
})

  describe('listarTodos', () => {
    it('deve retornar lista de usuarios sem senhas', async () => {
      Usuario.findAll.mockResolvedValue([
        { Id_Usuario: 'u1', Nome: 'Gui' },
        { Id_Usuario: 'u2', Nome: 'Kay' }
      ])

      const result = await usuarioService.listarTodos()
      expect(result).toHaveLength(2)
      expect(Usuario.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('atualizar', () => {
    it('deve atualizar dados do usuario', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ Id_Usuario: 'u1', Nome: 'Novo Nome', Senha: 'hash' })
      }
      Usuario.findByPk.mockResolvedValue(usuario)

      const result = await usuarioService.atualizar('u1', { Nome: 'Novo Nome' })
      expect(usuario.update).toHaveBeenCalledTimes(1)
      expect(result.Senha).toBeUndefined()
    })

    it('deve hashear senha ao atualizar', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ Id_Usuario: 'u1', Senha: 'hash' })
      }
      Usuario.findByPk.mockResolvedValue(usuario)

      await usuarioService.atualizar('u1', { Senha: 'nova123' })
      expect(bcryptjs.hash).toHaveBeenCalledWith('nova123', 10)
    })
  })

  describe('esqueciSenha', () => {
    it('deve enviar codigo de reset para email existente', async () => {
      const usuario = {
        get: jest.fn((field) => field === 'Email' ? 'gui@test.com' : 'Gui'),
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ Email: 'gui@test.com' })
      }
      Usuario.findOne.mockResolvedValue(usuario)

      const result = await usuarioService.esqueciSenha('gui@test.com')
      expect(result.mensagem).toContain('Código enviado')
      expect(usuario.update).toHaveBeenCalledTimes(1)
    })

    it('deve retornar mensagem generica quando email nao existe', async () => {
      Usuario.findOne.mockResolvedValue(null)

      const result = await usuarioService.esqueciSenha('nao@existe.com')
      expect(result.mensagem).toContain('Se o e-mail estiver cadastrado')
    })
  })

  describe('resetarSenha', () => {
    it('deve resetar senha com codigo valido', async () => {
      const futuro = new Date(Date.now() + 10 * 60 * 1000)
      const usuario = {
        Codigo_Verificacao: '123456',
        Codigo_Expiracao: futuro,
        update: jest.fn().mockResolvedValue(true)
      }
      Usuario.findOne.mockResolvedValue(usuario)

      const result = await usuarioService.resetarSenha('gui@test.com', '123456', 'nova123')
      expect(result.mensagem).toBe('Senha redefinida com sucesso.')
      expect(bcryptjs.hash).toHaveBeenCalledWith('nova123', 10)
    })

    it('deve lançar erro 400 quando codigo invalido', async () => {
      Usuario.findOne.mockResolvedValue({ Codigo_Verificacao: '999999' })

      await expect(usuarioService.resetarSenha('gui@test.com', '000000', 'nova123'))
        .rejects.toMatchObject({ statusCode: 400 })
    })

    it('deve lançar erro 400 quando codigo expirado', async () => {
      const passado = new Date(Date.now() - 1000)
      Usuario.findOne.mockResolvedValue({
        Codigo_Verificacao: '123456',
        Codigo_Expiracao: passado
      })

      await expect(usuarioService.resetarSenha('gui@test.com', '123456', 'nova123'))
        .rejects.toMatchObject({ statusCode: 400 })
    })
  })

  describe('verificarEmail - email ja verificado', () => {
    it('deve retornar token quando email ja verificado', async () => {
      const usuario = {
        Email_Verificado: true,
        toJSON: jest.fn().mockReturnValue({
          Id_Usuario: 'u1', Email: 'gui@test.com', Cargo: 'usuario',
          Senha: 'hash', Codigo_Verificacao: null, Codigo_Expiracao: null
        })
      }
      Usuario.findOne.mockResolvedValue(usuario)

      const result = await usuarioService.verificarEmail('gui@test.com', '123456')
      expect(result.token).toBe('fake_token')
    })
  })
