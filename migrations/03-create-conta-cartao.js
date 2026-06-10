'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conta_cartao', {
      id_conta: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      id_usuario: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuario', key: 'id_usuario' },
        onDelete: 'CASCADE'
      },
      nome_conta: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      tipo: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      titular: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      ultimos_digitos: {
        type: Sequelize.CHAR(4),
        allowNull: true
      },
      cor_hex: {
        type: Sequelize.CHAR(7),
        allowNull: false
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('conta_cartao');
  }
};