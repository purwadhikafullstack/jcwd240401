'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Provinces', {
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      province_name: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Provinces');
  }
};