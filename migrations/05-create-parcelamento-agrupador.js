'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parcelamento_agrupador', {
      id_parcelamento: {
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
      descricao_parcela: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      qtd_parcelas: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      data_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('parcelamento_agrupador');
  }
};