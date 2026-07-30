jest.mock('@/services/usuarioService.js', () => ({
  __esModule: true,
  default: {
    registrar: jest.fn(),
    verificarEmail: jest.fn(),
    reenviarCodigo: jest.fn(),
    login: jest.fn(),
    esqueciSenha: jest.fn(),
    resetarSenha: jest.fn(),
    buscarPorId: jest.fn(),
    listarTodos: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
  }
}))

import usuarioController from '@/controllers/usuarioController.js'
import usuarioService from '@/services/usuarioService.js'

describe('UsuarioController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('registrar', () => {
    it('deve retornar status 201 com os dados do resultado', async () => {
      usuarioService.registrar.mockResolvedValue({ requiresVerification: true, email: 'test@test.com' })
      const result = await usuarioController.registrar({ Nome: 'Test', Email: 'test@test.com', Senha: '123456' })
      expect(result.status).toBe(201)
      expect(result.data).toEqual({ requiresVerification: true, email: 'test@test.com' })
    })
  })

  describe('verificarEmail', () => {
    it('deve retornar 400 se email ou codigo estiverem ausentes', async () => {
      const result = await usuarioController.verificarEmail({ email: '', codigo: '' })
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com dados quando email e codigo são válidos', async () => {
      usuarioService.verificarEmail.mockResolvedValue({ usuario: {}, token: 'token123' })
      const result = await usuarioController.verificarEmail({ email: 'test@test.com', codigo: '123456' })
      expect(result.status).toBe(200)
      expect(result.data).toBeDefined()
    })
  })

  describe('reenviarCodigo', () => {
    it('deve retornar 400 se email estiver ausente', async () => {
      const result = await usuarioController.reenviarCodigo({ email: '' })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 quando email é válido', async () => {
      usuarioService.reenviarCodigo.mockResolvedValue({ mensagem: 'Código enviado' })
      const result = await usuarioController.reenviarCodigo({ email: 'test@test.com' })
      expect(result.status).toBe(200)
    })
  })

  describe('login', () => {
    it('deve retornar 400 se email ou senha estiverem ausentes', async () => {
      const result = await usuarioController.login({ Email: '', Senha: '' })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 com token quando credenciais são válidas', async () => {
      usuarioService.login.mockResolvedValue({ usuario: {}, token: 'token123' })
      const result = await usuarioController.login({ Email: 'test@test.com', Senha: '123456' })
      expect(result.status).toBe(200)
      expect(result.data.token).toBe('token123')
    })

    it('deve lançar erro com requiresVerification quando email não verificado', async () => {
      const error = new Error('Email não verificado')
      error.requiresVerification = true
      error.email = 'test@test.com'
      usuarioService.login.mockRejectedValue(error)
      await expect(usuarioController.login({ Email: 'test@test.com', Senha: '123456' }))
        .rejects.toMatchObject({ requiresVerification: true })
    })
  })

  describe('esqueciSenha', () => {
    it('deve retornar 400 se email estiver ausente', async () => {
      const result = await usuarioController.esqueciSenha({ email: '' })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 quando email é válido', async () => {
      usuarioService.esqueciSenha.mockResolvedValue({ mensagem: 'Código enviado' })
      const result = await usuarioController.esqueciSenha({ email: 'test@test.com' })
      expect(result.status).toBe(200)
    })
  })

  describe('resetarSenha', () => {
    it('deve retornar 400 se campos obrigatórios estiverem ausentes', async () => {
      const result = await usuarioController.resetarSenha({ email: '', codigo: '', novaSenha: '' })
      expect(result.status).toBe(400)
    })

    it('deve retornar 400 se nova senha tiver menos de 6 caracteres', async () => {
      const result = await usuarioController.resetarSenha({ email: 'test@test.com', codigo: '123456', novaSenha: '123' })
      expect(result.status).toBe(400)
    })

    it('deve retornar 200 quando dados são válidos', async () => {
      usuarioService.resetarSenha.mockResolvedValue({ mensagem: 'Senha redefinida' })
      const result = await usuarioController.resetarSenha({ email: 'test@test.com', codigo: '123456', novaSenha: '123456' })
      expect(result.status).toBe(200)
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar 200 com o usuario', async () => {
      usuarioService.buscarPorId.mockResolvedValue({ Id_Usuario: '1', Nome: 'Test' })
      const result = await usuarioController.buscarPorId('1')
      expect(result.status).toBe(200)
      expect(result.data.Nome).toBe('Test')
    })
  })

  describe('listarTodos', () => {
    it('deve retornar 200 com lista de usuarios', async () => {
      usuarioService.listarTodos.mockResolvedValue([{ Id_Usuario: '1' }, { Id_Usuario: '2' }])
      const result = await usuarioController.listarTodos()
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('atualizar', () => {
    it('deve retornar 200 com usuario atualizado', async () => {
      usuarioService.atualizar.mockResolvedValue({ Id_Usuario: '1', Nome: 'Atualizado' })
      const result = await usuarioController.atualizar('1', { Nome: 'Atualizado' })
      expect(result.status).toBe(200)
      expect(result.data.Nome).toBe('Atualizado')
    })
  })

  describe('deletar', () => {
    it('deve retornar 200 com mensagem de sucesso', async () => {
      usuarioService.deletar.mockResolvedValue({ mensagem: 'Usuário deletado com sucesso' })
      const result = await usuarioController.deletar('1')
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

})