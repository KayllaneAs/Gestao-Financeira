import models from '@/models/index.js'
import { fn, col } from 'sequelize'

const { Usuario } = models

class AdminService {
  async listarUsuarios() {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['Senha'] },
      order: [['Data_Criacao', 'DESC']]
    })
    return usuarios
  }

  async buscarEstatisticasSistema() {
  const [totalUsuarios, totalAdmins] = await Promise.all([
    Usuario.count(),
    Usuario.count({ where: { Cargo: 'admin' } }),
  ])

  const usuariosRecentes = await Usuario.findAll({
    attributes: { exclude: ['Senha'] },
    order: [['Data_Criacao', 'DESC']],
    limit: 5
  })

  return {
    totalUsuarios,
    totalAdmins,
    totalUsuariosComuns: totalUsuarios - totalAdmins,
    totalDespesas: 0,
    totalRendas: 0,
    totalContas: 0,
    totalReservas: 0,
    volumeTotalDespesas: 0,
    volumeTotalRendas: 0,
    usuariosRecentes
  }
}

  async atualizarCargo(id, cargo) {
    const usuario = await Usuario.findByPk(id)
    if (!usuario) {
      const error = new Error('Usuário não encontrado')
      error.statusCode = 404
      throw error
    }

    if (!['usuario', 'admin'].includes(cargo)) {
      const error = new Error('Cargo inválido. Use "usuario" ou "admin"')
      error.statusCode = 400
      throw error
    }

    await usuario.update({ Cargo: cargo })

    const { Senha, ...usuarioSemSenha } = usuario.toJSON()
    return usuarioSemSenha
  }

  async deletarUsuario(id, adminId) {
    if (id === adminId) {
      const error = new Error('Você não pode deletar sua própria conta')
      error.statusCode = 400
      throw error
    }

    const usuario = await Usuario.findByPk(id)
    if (!usuario) {
      const error = new Error('Usuário não encontrado')
      error.statusCode = 404
      throw error
    }

    await usuario.destroy()
    return { mensagem: 'Usuário deletado com sucesso' }
  }

  async buscarUsuario(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['Senha'] }
    })
    if (!usuario) {
      const error = new Error('Usuário não encontrado')
      error.statusCode = 404
      throw error
    }
    return usuario
  }
}

export default new AdminService()
