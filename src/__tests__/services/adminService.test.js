jest.mock('@/models/index.js', () => ({
  __esModule: true,
  default: {
    Usuario: {
      findAll: jest.fn(),
      count: jest.fn(),
      findByPk: jest.fn()
    }
  }
}))

import adminService from '@/services/adminService.js'
import models from '@/models/index.js'

const { Usuario } = models

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listarUsuarios', () => {
    it('deve listar todos os usuarios sem a senha', async () => {
      const usuarios = [
        {
          Id_Usuario: 'u1',
          Nome: 'Joao',
          Email: 'joao@email.com'
        },
        {
          Id_Usuario: 'u2',
          Nome: 'Maria',
          Email: 'maria@email.com'
        }
      ]

      Usuario.findAll.mockResolvedValue(usuarios)

      const result = await adminService.listarUsuarios()

      expect(Usuario.findAll).toHaveBeenCalledWith({
        attributes: { exclude: ['Senha'] },
        order: [['Data_Criacao', 'DESC']]
      })

      expect(result).toEqual(usuarios)
    })

    it('deve retornar lista vazia quando nao houver usuarios', async () => {
      Usuario.findAll.mockResolvedValue([])

      const result = await adminService.listarUsuarios()

      expect(result).toEqual([])
    })
  })

  describe('buscarEstatisticasSistema', () => {
    it('deve retornar estatisticas corretas do sistema', async () => {
      Usuario.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)

      const usuariosRecentes = [
        {
          Id_Usuario: 'u1',
          Nome: 'Joao'
        },
        {
          Id_Usuario: 'u2',
          Nome: 'Maria'
        }
      ]

      Usuario.findAll.mockResolvedValue(usuariosRecentes)

      const result = await adminService.buscarEstatisticasSistema()

      expect(Usuario.count).toHaveBeenCalledTimes(2)

      expect(Usuario.count).toHaveBeenNthCalledWith(1)

      expect(Usuario.count).toHaveBeenNthCalledWith(2, {
        where: { Cargo: 'admin' }
      })

      expect(Usuario.findAll).toHaveBeenCalledWith({
        attributes: { exclude: ['Senha'] },
        order: [['Data_Criacao', 'DESC']],
        limit: 5
      })

      expect(result).toEqual({
        totalUsuarios: 10,
        totalAdmins: 3,
        totalUsuariosComuns: 7,
        totalDespesas: 0,
        totalRendas: 0,
        totalContas: 0,
        totalReservas: 0,
        volumeTotalDespesas: 0,
        volumeTotalRendas: 0,
        usuariosRecentes
      })
    })

    it('deve retornar zero usuarios comuns quando todos forem admins', async () => {
      Usuario.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5)

      Usuario.findAll.mockResolvedValue([])

      const result = await adminService.buscarEstatisticasSistema()

      expect(result.totalUsuarios).toBe(5)
      expect(result.totalAdmins).toBe(5)
      expect(result.totalUsuariosComuns).toBe(0)
      expect(result.usuariosRecentes).toEqual([])
    })
  })

  describe('atualizarCargo', () => {
    it('deve atualizar cargo para admin', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        Nome: 'Joao',
        Cargo: 'usuario',
        Senha: 'senha-secreta',
        update: jest.fn().mockResolvedValue(),
        toJSON: jest.fn(() => ({
          Id_Usuario: 'u1',
          Nome: 'Joao',
          Cargo: 'admin',
          Senha: 'senha-secreta'
        }))
      }

      Usuario.findByPk.mockResolvedValue(usuario)

      const result = await adminService.atualizarCargo('u1', 'admin')

      expect(Usuario.findByPk).toHaveBeenCalledWith('u1')

      expect(usuario.update).toHaveBeenCalledWith({
        Cargo: 'admin'
      })

      expect(result).toEqual({
        Id_Usuario: 'u1',
        Nome: 'Joao',
        Cargo: 'admin'
      })

      expect(result.Senha).toBeUndefined()
    })

    it('deve atualizar cargo para usuario', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        Nome: 'Joao',
        Cargo: 'admin',
        Senha: 'senha-secreta',
        update: jest.fn().mockResolvedValue(),
        toJSON: jest.fn(() => ({
          Id_Usuario: 'u1',
          Nome: 'Joao',
          Cargo: 'usuario',
          Senha: 'senha-secreta'
        }))
      }

      Usuario.findByPk.mockResolvedValue(usuario)

      const result = await adminService.atualizarCargo('u1', 'usuario')

      expect(usuario.update).toHaveBeenCalledWith({
        Cargo: 'usuario'
      })

      expect(result.Cargo).toBe('usuario')
      expect(result.Senha).toBeUndefined()
    })

    it('deve retornar erro 404 quando usuario nao existe', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(
        adminService.atualizarCargo('inexistente', 'admin')
      ).rejects.toMatchObject({
        message: 'Usuário não encontrado',
        statusCode: 404
      })
    })

    it('deve retornar erro 400 para cargo invalido', async () => {
      const usuario = {
        update: jest.fn()
      }

      Usuario.findByPk.mockResolvedValue(usuario)

      await expect(
        adminService.atualizarCargo('u1', 'gerente')
      ).rejects.toMatchObject({
        message: 'Cargo inválido. Use "usuario" ou "admin"',
        statusCode: 400
      })

      expect(usuario.update).not.toHaveBeenCalled()
    })
  })

  describe('deletarUsuario', () => {
    it('deve impedir que o admin delete a propria conta', async () => {
      await expect(
        adminService.deletarUsuario('admin1', 'admin1')
      ).rejects.toMatchObject({
        message: 'Você não pode deletar sua própria conta',
        statusCode: 400
      })

      expect(Usuario.findByPk).not.toHaveBeenCalled()
    })

    it('deve retornar erro 404 quando usuario nao existe', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(
        adminService.deletarUsuario('u1', 'admin1')
      ).rejects.toMatchObject({
        message: 'Usuário não encontrado',
        statusCode: 404
      })
    })

    it('deve deletar usuario com sucesso', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        Nome: 'Joao',
        destroy: jest.fn().mockResolvedValue()
      }

      Usuario.findByPk.mockResolvedValue(usuario)

      const result = await adminService.deletarUsuario('u1', 'admin1')

      expect(Usuario.findByPk).toHaveBeenCalledWith('u1')
      expect(usuario.destroy).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        mensagem: 'Usuário deletado com sucesso'
      })
    })
  })

  describe('buscarUsuario', () => {
    it('deve buscar usuario sem retornar a senha', async () => {
      const usuario = {
        Id_Usuario: 'u1',
        Nome: 'Joao',
        Email: 'joao@email.com'
      }

      Usuario.findByPk.mockResolvedValue(usuario)

      const result = await adminService.buscarUsuario('u1')

      expect(Usuario.findByPk).toHaveBeenCalledWith('u1', {
        attributes: { exclude: ['Senha'] }
      })

      expect(result).toEqual(usuario)
    })

    it('deve retornar erro 404 quando usuario nao existe', async () => {
      Usuario.findByPk.mockResolvedValue(null)

      await expect(
        adminService.buscarUsuario('inexistente')
      ).rejects.toMatchObject({
        message: 'Usuário não encontrado',
        statusCode: 404
      })
    })
  })
})
