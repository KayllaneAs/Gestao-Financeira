import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '@/config/env.js'
import models from '@/models/index.js'
import emailService from '@/services/emailService.js'

const { Usuario } = models

function gerarCodigo6Digitos() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

class UsuarioService {
  gerarToken(usuario) {
    return jwt.sign(
      { id: usuario.Id_Usuario, email: usuario.Email, cargo: usuario.Cargo },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    )
  }

  async registrar(dados) {
    const existente = await Usuario.findOne({ where: { Email: dados.Email } })
    if (existente) {
      const error = new Error('Email já cadastrado')
      error.statusCode = 409
      throw error
    }

    const senhaHash = await bcryptjs.hash(dados.Senha, 10)
    const codigo = gerarCodigo6Digitos()
    const expiracao = new Date(Date.now() + 15 * 60 * 1000)

    await Usuario.create({
      ...dados,
      Senha: senhaHash,
      Codigo_Verificacao: codigo,
      Codigo_Expiracao: expiracao,
      Email_Verificado: false,
    })

    await emailService.enviarCodigoVerificacao(dados.Email, dados.Nome, codigo)

    return { requiresVerification: true, email: dados.Email }
  }

  async verificarEmail(email, codigo) {
    const usuario = await Usuario.findOne({ where: { Email: email } })

    if (!usuario) {
      const error = new Error('Usuário não encontrado')
      error.statusCode = 404
      throw error
    }

    if (usuario.Email_Verificado) {
      const { Senha, Codigo_Verificacao, Codigo_Expiracao, ...rest } = usuario.toJSON()
      return { usuario: rest, token: this.gerarToken(usuario) }
    }

    if (!usuario.Codigo_Verificacao || usuario.Codigo_Verificacao !== codigo) {
      const error = new Error('Código inválido')
      error.statusCode = 400
      throw error
    }

    if (new Date() > new Date(usuario.Codigo_Expiracao)) {
      const error = new Error('Código expirado. Solicite um novo código.')
      error.statusCode = 400
      throw error
    }

    await usuario.update({
      Email_Verificado: true,
      Codigo_Verificacao: null,
      Codigo_Expiracao: null,
    })

    const { Senha, Codigo_Verificacao, Codigo_Expiracao, ...usuarioSemSenha } = usuario.toJSON()
    return { usuario: usuarioSemSenha, token: this.gerarToken(usuario) }
  }

  async reenviarCodigo(email) {
    const usuario = await Usuario.findOne({ where: { Email: email } })

    if (!usuario) {
      return { mensagem: 'Se o e-mail estiver cadastrado, um novo código foi enviado.' }
    }

    if (usuario.Email_Verificado) {
      const error = new Error('Este e-mail já foi verificado.')
      error.statusCode = 400
      throw error
    }

    const codigo = gerarCodigo6Digitos()
    const expiracao = new Date(Date.now() + 15 * 60 * 1000)

    await usuario.update({ Codigo_Verificacao: codigo, Codigo_Expiracao: expiracao })
    await emailService.enviarCodigoVerificacao(usuario.Email, usuario.Nome, codigo)

    return { mensagem: 'Novo código enviado para o seu e-mail.' }
  }

  async login(email, senha) {
    const usuario = await Usuario.findOne({ where: { Email: email } })

    if (!usuario) {
      const error = new Error('Email ou senha inválidos')
      error.statusCode = 401
      throw error
    }

    const senhaValida = await bcryptjs.compare(senha, usuario.Senha)
    if (!senhaValida) {
      const error = new Error('Email ou senha inválidos')
      error.statusCode = 401
      throw error
    }

    if (!usuario.Email_Verificado) {
      const error = new Error('E-mail não verificado. Verifique sua caixa de entrada.')
      error.statusCode = 403
      error.requiresVerification = true
      error.email = usuario.Email
      throw error
    }

    const { Senha, Codigo_Verificacao, Codigo_Expiracao, ...usuarioSemSenha } = usuario.toJSON()
    return { usuario: usuarioSemSenha, token: this.gerarToken(usuario) }
  }

  async esqueciSenha(email) {
    const usuario = await Usuario.findOne({ where: { Email: email } })

    if (!usuario) {
      return { mensagem: 'Se o e-mail estiver cadastrado, um código foi enviado.' }
    }

    const codigo = gerarCodigo6Digitos()
    const expiracao = new Date(Date.now() + 15 * 60 * 1000)

    await usuario.update({ Codigo_Verificacao: codigo, Codigo_Expiracao: expiracao })
    await emailService.enviarCodigoResetSenha(usuario.Email, usuario.Nome, codigo)

    return { mensagem: 'Código enviado para o seu e-mail.' }
  }

  async resetarSenha(email, codigo, novaSenha) {
    const usuario = await Usuario.findOne({ where: { Email: email } })

    if (!usuario || !usuario.Codigo_Verificacao || usuario.Codigo_Verificacao !== codigo) {
      const error = new Error('Código inválido')
      error.statusCode = 400
      throw error
    }

    if (new Date() > new Date(usuario.Codigo_Expiracao)) {
      const error = new Error('Código expirado. Solicite um novo código.')
      error.statusCode = 400
      throw error
    }

    const senhaHash = await bcryptjs.hash(novaSenha, 10)

    await usuario.update({
      Senha: senhaHash,
      Codigo_Verificacao: null,
      Codigo_Expiracao: null,
      Email_Verificado: true,
    })

    return { mensagem: 'Senha redefinida com sucesso.' }
  }

  async buscarPorId(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['Senha', 'Codigo_Verificacao', 'Codigo_Expiracao'] }
    })

    if (!usuario) {
      const error = new Error('Usuário não encontrado')
      error.statusCode = 404
      throw error
    }

    return usuario
  }

  async listarTodos() {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['Senha', 'Codigo_Verificacao', 'Codigo_Expiracao'] }
    })
    return usuarios
  }

  async atualizar(id, dados) {
    const usuario = await this.buscarPorId(id)

    if (dados.Senha) {
      dados.Senha = await bcryptjs.hash(dados.Senha, 10)
    }

    await usuario.update(dados)

    const { Senha, ...usuarioSemSenha } = usuario.toJSON()
    return usuarioSemSenha
  }

  async deletar(id) {
    const usuario = await this.buscarPorId(id)
    await usuario.destroy()
    return { mensagem: 'Usuário deletado com sucesso' }
  }
}

export default new UsuarioService()
