'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reserva', {
      id_reserva: {
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
      nome_objetivo: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      valor_alvo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      valor_atual: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      data_limite: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('reserva');
  }
};