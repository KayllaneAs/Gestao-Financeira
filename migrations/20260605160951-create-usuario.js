'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Alterado para 'usuarios' em minúsculo conforme o planejamento
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false // Nome é obrigatório no cadastro
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Impede e-mails duplicados no sistema
      },
      senha_hash: {
        type: Sequelize.STRING,
        allowNull: false // Segurança: a senha criptografada é obrigatória
      },
      cargo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'usuario' // Padrão inicial definido no RBAC
      },
      verificado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false // Começa como falso até validar o OTP por e-mail
      },
      created_at: { // Ajustado para snake_case conforme escopo do banco
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: { // Ajustado para snake_case
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};