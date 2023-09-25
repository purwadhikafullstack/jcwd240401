"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Discounts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Branches",
          key: "id",
        },
      },
      discount_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Discount_Types",
          key: "id",
        },
      },
      amount: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      expiredDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isExpired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Discounts");
  },
};
