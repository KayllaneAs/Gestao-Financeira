'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('familia', {
      id_familia: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      nome_grupo: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('familia');
  }
};