jest.mock('@/services/adminService.js', () => ({
  __esModule: true,
  default: {
    listarUsuarios: jest.fn(),
    buscarEstatisticasSistema: jest.fn(),
    atualizarCargo: jest.fn(),
    deletarUsuario: jest.fn(),
    buscarUsuario: jest.fn(),
  }
}))

import adminController from '@/controllers/adminController.js'
import adminService from '@/services/adminService.js'

describe('AdminController', () => {

  beforeEach(() => jest.clearAllMocks())

  describe('listarUsuarios', () => {
    it('deve retornar 200 com lista de usuarios', async () => {
      adminService.listarUsuarios.mockResolvedValue([{ Id_Usuario: '1' }, { Id_Usuario: '2' }])
      const result = await adminController.listarUsuarios()
      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(2)
    })
  })

  describe('estatisticasSistema', () => {
    it('deve retornar 200 com estatísticas do sistema', async () => {
      adminService.buscarEstatisticasSistema.mockResolvedValue({ totalUsuarios: 10, totalAdmins: 2 })
      const result = await adminController.estatisticasSistema()
      expect(result.status).toBe(200)
      expect(result.data.totalUsuarios).toBe(10)
    })
  })

  describe('atualizarCargo', () => {
    it('deve retornar 400 se cargo estiver ausente', async () => {
      const result = await adminController.atualizarCargo('1', {})
      expect(result.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('deve retornar 200 com usuario atualizado', async () => {
      adminService.atualizarCargo.mockResolvedValue({ Id_Usuario: '1', Cargo: 'admin' })
      const result = await adminController.atualizarCargo('1', { cargo: 'admin' })
      expect(result.status).toBe(200)
      expect(result.data.Cargo).toBe('admin')
    })
  })

  describe('deletarUsuario', () => {
    it('deve retornar 200 com mensagem de sucesso', async () => {
      adminService.deletarUsuario.mockResolvedValue({ mensagem: 'Usuário deletado com sucesso' })
      const result = await adminController.deletarUsuario('2', '1')
      expect(result.status).toBe(200)
      expect(result.data.mensagem).toBeDefined()
    })
  })

  describe('buscarUsuario', () => {
    it('deve retornar 200 com o usuario', async () => {
      adminService.buscarUsuario.mockResolvedValue({ Id_Usuario: '1', Nome: 'Test' })
      const result = await adminController.buscarUsuario('1')
      expect(result.status).toBe(200)
      expect(result.data.Nome).toBe('Test')
    })
  })

})