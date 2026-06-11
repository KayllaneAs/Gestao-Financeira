'use strict';

const SENHA_MOCK = '$2b$10$ItIpjIWrqL.b3nvKp7iJneCmr2j5wB0HNk9B9Y1IfHunjZC53q7TS';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('usuario', [
      {
        id_usuario: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        nome: 'Laura Vasconcelos',
        email: 'laura@financeapp.com',
        senha: SENHA_MOCK,
        cargo: 'admin',
        email_verificado: true,
        data_criacao: new Date()
      },
      {
        id_usuario: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        nome: 'Kayllane Usuária',
        email: 'user@financeapp.com',
        senha: SENHA_MOCK,
        cargo: 'usuario',
        email_verificado: true,
        data_criacao: new Date()
      }
    ], {})
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuario', null, {})
  }
}