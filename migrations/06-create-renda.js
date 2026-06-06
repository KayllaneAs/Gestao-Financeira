'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('renda', {
      id_renda: {
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
      descricao_renda: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      valor_renda: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('renda');
  }
};