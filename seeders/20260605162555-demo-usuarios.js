'use strict';
// Para fins de teste inicial, as senhas abaixo correspondem a 'Senha123' criptografada
const SENHA_MOCK = '$2a$10$7R9vM17bWbCExB4A7v2eO.Yk6g0M3Vf96NnZ6yN2vT8h7Z8E5pG1W';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [
      {
        nome: 'Guilherme Admin',
        email: 'admin@financeapp.com',
        senha_hash: SENHA_MOCK,
        cargo: 'admin',
        verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Kayllane Usuária',
        email: 'user@financeapp.com',
        senha_hash: SENHA_MOCK,
        cargo: 'usuario',
        verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};