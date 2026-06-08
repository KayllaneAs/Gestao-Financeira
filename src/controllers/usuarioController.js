import usuarioService from '@/services/usuarioService.js'

class UsuarioController {
  async registrar(body) {
    const resultado = await usuarioService.registrar(body)
    return { status: 201, data: resultado }
  }

  async verificarEmail(body) {
    const { email, codigo } = body
    if (!email || !codigo) {
      return { status: 400, error: 'E-mail e código são obrigatórios' }
    }
    const resultado = await usuarioService.verificarEmail(email, codigo)
    return { status: 200, data: resultado }
  }

  async reenviarCodigo(body) {
    const { email } = body
    if (!email) {
      return { status: 400, error: 'E-mail é obrigatório' }
    }
    const resultado = await usuarioService.reenviarCodigo(email)
    return { status: 200, data: resultado }
  }

  async login(body) {
    const Email = body.Email || body.email
    const Senha = body.Senha || body.senha
    if (!Email || !Senha) {
      return { status: 400, error: 'Email e senha são obrigatórios' }
    }
    try {
      const resultado = await usuarioService.login(Email, Senha)
      return { status: 200, data: resultado }
    } catch (error) {
      if (error.requiresVerification) {
        const err = new Error(error.message)
        err.status = 403
        err.requiresVerification = true
        err.email = error.email
        throw err
      }
      throw error
    }
  }

  async esqueciSenha(body) {
    const { email } = body
    if (!email) {
      return { status: 400, error: 'E-mail é obrigatório' }
    }
    const resultado = await usuarioService.esqueciSenha(email)
    return { status: 200, data: resultado }
  }

  async resetarSenha(body) {
    const { email, codigo, novaSenha } = body
    if (!email || !codigo || !novaSenha) {
      return { status: 400, error: 'E-mail, código e nova senha são obrigatórios' }
    }
    if (novaSenha.length < 6) {
      return { status: 400, error: 'A nova senha deve ter pelo menos 6 caracteres' }
    }
    const resultado = await usuarioService.resetarSenha(email, codigo, novaSenha)
    return { status: 200, data: resultado }
  }

  async buscarPorId(id) {
    const usuario = await usuarioService.buscarPorId(id)
    return { status: 200, data: usuario }
  }

  async listarTodos() {
    const usuarios = await usuarioService.listarTodos()
    return { status: 200, data: usuarios }
  }

  async atualizar(id, body) {
    const usuario = await usuarioService.atualizar(id, body)
    return { status: 200, data: usuario }
  }

  async deletar(id) {
    const resultado = await usuarioService.deletar(id)
    return { status: 200, data: resultado }
  }
}

export default new UsuarioController()
