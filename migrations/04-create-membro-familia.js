'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('membro_familia', {
      id_membro: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      id_familia: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'familia', key: 'id_familia' },
        onDelete: 'CASCADE'
      },
      nome_membro: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      parentesco: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('membro_familia');
  }
};