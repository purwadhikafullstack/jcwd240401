'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cities', {
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      province_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Provinces",
          key: "province_id"
        }
      },
      city_name: {
        type: Sequelize.STRING
      },
      postal_code: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Cities');
  }
};