'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('despesa', {
      id_despesa: {
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
      id_conta: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conta_cartao', key: 'id_conta' }
      },
      id_parcelamento: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'parcelamento_agrupador', key: 'id_parcelamento' },
        onDelete: 'CASCADE'
      },
      descricao_despesa: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      valor_parcela: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      categoria: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      numero_parcela: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('despesa');
  }
};